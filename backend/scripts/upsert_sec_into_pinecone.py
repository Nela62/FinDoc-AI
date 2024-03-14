import os

from pinecone import Pinecone
from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    Settings,
)
from llama_index.vector_stores.pinecone import PineconeVectorStore
from llama_index.embeddings.voyageai import VoyageEmbedding

model_name = "voyage-lite-02-instruct"
voyage_api_key = os.environ.get("VOYAGE_API_KEY")

embed_model = VoyageEmbedding(
    model_name=model_name,
    voyage_api_key=voyage_api_key,
)

Settings.embed_model = embed_model

# embeddings = embed_model.get_query_embedding("instruct")

documents = SimpleDirectoryReader("data/sec-edgar-filings").load_data()

pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
pinecone_index = pc.Index("sec")
vector_store = PineconeVectorStore(pinecone_index=pinecone_index)
storage_context = StorageContext.from_defaults(vector_store=vector_store)
index = VectorStoreIndex.from_documents(documents, storage_context=storage_context)
