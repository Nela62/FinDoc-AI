import os
from fire import Fire
from tqdm import tqdm
import asyncio
from pytickersymbols import PyTickerSymbols
from app.documents.file_utils import get_available_filings, Filing
from stock_utils import get_stocks_by_symbol, Stock
from app.supabase.client import service_client, vector_client
from llama_index.readers.file import PDFReader
from llama_index.vector_stores.supabase import SupabaseVectorStore
from fastapi.encoders import jsonable_encoder
from llama_index.llms.anthropic import Anthropic
from llama_index.core import Settings, VectorStoreIndex, ServiceContext, StorageContext
from llama_index.embeddings.voyageai import VoyageEmbedding
from app.core.config import settings

# from app.models.db import Document
from app.schema import (
    SecDocumentMetadata,
    DocumentMetadataMap,
    DocumentMetadataKeysEnum,
    SecDocumentTypeEnum,
    Document,
)

# DEFAULT_URL_BASE = "https://dl94gqvzlh4k8.cloudfront.net"
DEFAULT_DOC_DIR = "data/"


async def upsert_document(doc_dir: str, stock: Stock, filing: Filing):
    # construct a string for just the document's sub-path after the doc_dir
    # e.g. "sec-edgar-filings/AAPL/10-K/0000320193-20-000096/primary-document.pdf"
    doc_path = os.path.relpath(filing.file_path, doc_dir)
    doc_type = (
        SecDocumentTypeEnum.TEN_K
        if filing.filing_type == "10-K"
        else SecDocumentTypeEnum.TEN_Q
    )
    sec_doc_metadata = SecDocumentMetadata(
        company_name=stock.name,
        company_ticker=stock.symbol,
        doc_type=doc_type,
        year=filing.year,
        quarter=filing.quarter,
        accession_number=filing.accession_number,
        cik=filing.cik,
        period_of_report_date=filing.period_of_report_date,
        filed_as_of_date=filing.filed_as_of_date,
        date_as_of_change=filing.date_as_of_change,
    )
    metadata_map: DocumentMetadataMap = {
        "url": doc_path,
        **jsonable_encoder(sec_doc_metadata.model_dump(exclude_none=True)),
    }
    print(metadata_map)

    res = service_client.table("documents").upsert(metadata_map).execute()
    doc_id = res.data[0]["id"]
    print(doc_id)
    with open(filing.file_path, "rb") as f:
        service_client.storage.from_("public-documents").upload(
            file=f,
            path=doc_path,
            file_options={"content-type": "application/pdf"},
        )

    embedding_model = VoyageEmbedding(
        model_name="voyage-lite-02-instruct",
        voyage_api_key=settings.VOYAGE_API_KEY,
    )
    # tokenizer = Anthropic().tokenizer
    # Settings.tokenizer = tokenizer
    llm = Anthropic(
        temperature=0,
        model="claude-3-opus-20240229",
        # streaming=False,
        api_key=settings.ANTHROPIC_API_KEY,
    )
    service_context = ServiceContext.from_defaults(
        # callback_manager=callback_manager,
        llm=llm,
        embed_model=embedding_model,
    )
    vector_store = SupabaseVectorStore(
        postgres_connection_string=settings.DATABASE_URL,
        collection_name=settings.VECTOR_STORE_TABLE_NAME,
        dimension=1024,
    )
    reader = PDFReader()
    docs = reader.load_data(
        filing.file_path,
        extra_info={"db_document_id": doc_id},
    )
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    VectorStoreIndex.from_documents(
        docs,
        storage_context=storage_context,
        service_context=service_context,
    )
    vx = vector_client.get_or_create_collection(name="documents", dimension=1024)
    vx.create_index()


async def async_upsert_documents_from_filings(doc_dir: str):
    """
    Upserts SEC documents into the database based on what has been downloaded to the filesystem.
    """
    filings = get_available_filings(doc_dir)
    stocks_data = PyTickerSymbols()
    stocks_dict = get_stocks_by_symbol(stocks_data.get_all_indices())
    for filing in tqdm(filings, desc="Upserting docs from filings"):
        if filing.symbol not in stocks_dict:
            print(f"Symbol {filing.symbol} not found in stocks_dict. Skipping.")
            continue
        stock = stocks_dict[filing.symbol]
        await upsert_document(doc_dir, stock, filing)


def main_upsert_documents_from_filings(doc_dir: str = DEFAULT_DOC_DIR):
    """
    Upserts SEC documents into the database based on what has been downloaded to the filesystem.
    """

    asyncio.run(async_upsert_documents_from_filings(doc_dir))


if __name__ == "__main__":
    Fire(main_upsert_documents_from_filings)
