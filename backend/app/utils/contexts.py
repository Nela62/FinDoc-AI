# from llama_index.llms import Anthropic
from typing import List
from llama_index.llms.openai import OpenAI
from llama_index.core import StorageContext, ServiceContext, Settings
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.voyageai import VoyageEmbedding
from llama_index.vector_stores.supabase import SupabaseVectorStore
from llama_index.core.callbacks.base import BaseCallbackHandler, CallbackManager
from app.core.config import settings

from llama_index.llms.cohere import Cohere


def get_vector_store():
    vector_store = SupabaseVectorStore(
        postgres_connection_string=settings.DATABASE_URL,
        collection_name=settings.VECTOR_STORE_TABLE_NAME,
        dimension=1024,
    )
    return vector_store


def get_storage_context():
    vector_store = SupabaseVectorStore(
        postgres_connection_string=settings.DATABASE_URL,
        collection_name=settings.VECTOR_STORE_TABLE_NAME,
        dimension=1024,
    )

    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    return storage_context


def get_rag_service_context(callback_handlers: List[BaseCallbackHandler]):
    callback_manager = CallbackManager(callback_handlers)
    embedding_model = VoyageEmbedding(
        model_name="voyage-lite-02-instruct",
        voyage_api_key=settings.VOYAGE_API_KEY,
    )
    node_parser = SentenceSplitter.from_defaults(
        chunk_size=512,
        chunk_overlap=10,
        # callback_manager=callback_manager,
    )
    llm = Cohere(api_key=settings.COHERE_API_KEY, model="command-r")
    service_context = ServiceContext.from_defaults(
        callback_manager=callback_manager,
        llm=llm,
        embed_model=embedding_model,
        node_parser=node_parser,
    )
    return service_context


def get_service_context(callback_handlers: List[BaseCallbackHandler]):
    callback_manager = CallbackManager(callback_handlers)
    embedding_model = VoyageEmbedding(
        model_name="voyage-lite-02-instruct",
        voyage_api_key=settings.VOYAGE_API_KEY,
    )
    node_parser = SentenceSplitter.from_defaults(
        chunk_size=512,
        chunk_overlap=10,
        # callback_manager=callback_manager,
    )
    llm = OpenAI(temperature=0, model="gpt-3.5-turbo", api_key=settings.OPENAI_API_KEY)
    # llm = Anthropic(
    #     temperature=0,
    #     # model="claude-3-opus-20240229",
    #     model="claude-3-haiku-20240307",
    #     api_key=settings.ANTHROPIC_API_KEY,
    # )
    service_context = ServiceContext.from_defaults(
        callback_manager=callback_manager,
        llm=llm,
        embed_model=embedding_model,
        node_parser=node_parser,
    )
    return service_context
