from pathlib import Path
from fire import Fire
from tqdm import tqdm
import asyncio
from pytickersymbols import PyTickerSymbols
from backend.app.documents.file_utils import get_available_filings, Filing
from stock_utils import get_stocks_by_symbol, Stock
from app.supabase.client import service_client
from fastapi.encoders import jsonable_encoder

# from app.models.db import Document
from app.schema import (
    SecDocumentMetadata,
    DocumentMetadataMap,
    DocumentMetadataKeysEnum,
    SecDocumentTypeEnum,
    Document,
)

DEFAULT_URL_BASE = "https://dl94gqvzlh4k8.cloudfront.net"
DEFAULT_DOC_DIR = "data/"


async def upsert_document(url: str, stock: Stock, filing: Filing, url_base: str):
    # construct a string for just the document's sub-path after the doc_dir
    # e.g. "sec-edgar-filings/AAPL/10-K/0000320193-20-000096/primary-document.pdf"
    doc_path = Path(filing.file_path).relative_to(doc_dir)

    script_dir = Path(__file__).parent
    doc_dir = script_dir / "data"

    doc_path = Path(filing.file_path).relative_to(doc_dir)
    url_path = str(doc_path).lstrip("/")
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
        url: url_path,
        DocumentMetadataKeysEnum.SEC_DOCUMENT: jsonable_encoder(
            sec_doc_metadata.model_dump(exclude_none=True)
        ),
    }
    with open(filing.file_path, "rb") as f:
        service_client.storage.from_("public-documents").upload(
            file=f,
            path=url_path,
            file_options={"content-type": "application/pdf"},
        )
    service_client.table("documents").upsert(**metadata_map).execute()
    # TODO: upload file to vector store


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


def main_upsert_documents_from_filings(
    url_base: str = DEFAULT_URL_BASE, doc_dir: str = DEFAULT_DOC_DIR
):
    """
    Upserts SEC documents into the database based on what has been downloaded to the filesystem.
    """

    asyncio.run(async_upsert_documents_from_filings(url_base, doc_dir))


if __name__ == "__main__":
    Fire(main_upsert_documents_from_filings)
