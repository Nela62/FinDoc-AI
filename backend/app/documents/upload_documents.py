from typing import List
from pathlib import Path
from tempfile import TemporaryDirectory
import download_sec_filings
from fire import Fire
from download_sec_filings import DEFAULT_CIKS, DEFAULT_FILING_TYPES
from llama_index.embeddings.voyageai import VoyageEmbedding
from llama_index.core.indices.service_context import ServiceContext
from llama_index.core.node_parser import SentenceSplitter
from llama_index.readers.file import PDFReader
from llama_index.vector_stores.supabase import SupabaseVectorStore
from app.chat.constants import (
    NODE_PARSER_CHUNK_OVERLAP,
    NODE_PARSER_CHUNK_SIZE,
)

from llama_index.llms.anthropic import Anthropic
from llama_index.core import Settings, VectorStoreIndex, ServiceContext, StorageContext

from app.supabase.client import supabase, service_client, vector_client
from app.schema import Document as DocumentSchema
from app.core.config import settings


def upload_public_documents_to_storage(
    ciks: List[str] = DEFAULT_CIKS, filing_types: List[str] = DEFAULT_FILING_TYPES
):
    with TemporaryDirectory() as temp_dir:
        print(f"Downloading SEC filings")
        download_sec_filings.main(
            output_dir=temp_dir, ciks=ciks, file_types=filing_types
        )

    return


def fetch_and_read_document(document: DocumentSchema):
    with TemporaryDirectory() as temp_dir:
        temp_file_path = Path(temp_dir) / f"{str(document['id'])}.pdf"
        with open(temp_file_path, "wb") as temp_file:
            res = service_client.storage.from_("public-documents").download(
                document["url"]
            )
            temp_file.write(res)
            reader = PDFReader()
            return reader.load_data(
                temp_file_path,
                extra_info={"db_document_id": document["id"], "url": document["url"]},
            )


# TODO: apply this function only to new documents
# TODO: change the way nodes are chunked
# TODO: extract and insert metadata
def main():
    upload_public_documents_to_storage()

    res = service_client.table("documents").select("*").execute()
    documents = res.data
    # Upload an embedding to vector db
    embedding_model = VoyageEmbedding(
        model_name="voyage-lite-02-instruct",
        voyage_api_key=settings.VOYAGE_API_KEY,
    )
    # node_parser = SentenceSplitter.from_defaults(
    #     chunk_size=NODE_PARSER_CHUNK_SIZE,
    #     chunk_overlap=NODE_PARSER_CHUNK_OVERLAP,
    #     # callback_manager=callback_manager,
    # )

    tokenizer = Anthropic().tokenizer
    Settings.tokenizer = tokenizer
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
    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    for doc in documents:
        docs = fetch_and_read_document(doc)
        print(len(docs))
        vector_store.add(docs)
        # storage_context.docstore.add_documents(docs)

        # index = VectorStoreIndex.from_documents(
        #     docs,
        #     storage_context=storage_context,
        #     service_context=service_context,
        # )

    # Upload document metadata to db
    vx = vector_client.get_or_create_collection(name="documents", dimension=1024)
    vx.create_index()
    return


if __name__ == "__main__":
    Fire(main)
