from anthropic import Anthropic
from llama_index.vector_stores.supabase import SupabaseVectorStore
from llama_index.core import (
    StorageContext,
    ServiceContext,
    load_indices_from_storage,
    VectorStoreIndex,
)
import re
from app.supabase.client import service_client
from app.utils.contexts import (
    get_service_context,
    get_storage_context,
    get_vector_store,
)
from app.core.config import settings


def construct_format_tool_for_claude_prompt(name, description, parameters):
    constructed_prompt = (
        "<tool_description>\n"
        f"<tool_name>{name}</tool_name>\n"
        "<description>\n"
        f"{description}\n"
        "</description>\n"
        "<parameters>\n"
        f"{construct_format_parameters_prompt(parameters)}\n"
        "</parameters>\n"
        "</tool_description>"
    )
    return constructed_prompt


def construct_format_parameters_prompt(parameters):
    constructed_prompt = "\n".join(
        f"<parameter>\n<name>{parameter['name']}</name>\n<type>{parameter['type']}</type>\n<description>{parameter['description']}</description>\n</parameter>"
        for parameter in parameters
    )

    return constructed_prompt


def get_query_tool():
    # docs = service_client.table("documents").select("*").limit(3).execute()
    # index_ids = [str(doc["id"]) for doc in docs.data]
    # indices = load_indices_from_storage(
    #     index_ids=index_ids,
    #     storage_context=get_storage_context(),
    #     service_context=get_service_context(),
    # )
    # doc_id_to_index = dict(zip(index_ids, indices))
    # query_engine = indices[0].as_query_engine()
    index = VectorStoreIndex.from_vector_store(
        vector_store=get_vector_store(), service_context=get_service_context()
    )
    try:
        query_engine = index.as_query_engine()
        response = query_engine.query("How much did apple earn?")
        print(response)
    except Exception as e:
        print(e)


# TODO: add types
async def get_reports_engine():
    client = Anthropic()
    model_name = "claude-3-opus-20240229"

    message = (
        client.messages.create(
            model=model_name,
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": "I need a report on the sales of the last quarter.",
                }
            ],
        )
        .content[0]
        .text
    )
    print(message)


get_query_tool()
