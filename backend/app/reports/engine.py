from llama_index.vector_stores.supabase import SupabaseVectorStore

from typing import Dict, Any, Optional, List
from llama_index.core import (
    StorageContext,
    ServiceContext,
    load_index_from_storage,
    VectorStoreIndex,
)
from llama_index.core.callbacks.base import BaseCallbackHandler, CallbackManager
from llama_index.core.agent import ReActAgent
from llama_index.agent.openai import OpenAIAgent

from llama_index.core.callbacks.schema import CBEventType, EventPayload
from llama_index.core.callbacks import CallbackManager
from llama_index.llms.openai import OpenAI
from llama_index.core.llms import ChatMessage
from llama_index.core.tools import BaseTool, FunctionTool, QueryEngineTool, ToolMetadata
from llama_index.core.query_engine import CitationQueryEngine
import re
from app.supabase.client import service_client
from app.utils.contexts import (
    get_service_context,
    get_rag_service_context,
    get_storage_context,
    get_vector_store,
)
from llama_index.core.query_engine import SubQuestionQueryEngine

# from llama_index.llms.anthropic import Anthropic
from llama_index.core.vector_stores import ExactMatchFilter, MetadataFilters
from app.core.config import settings
from app.schema import SecDocumentMetadata
from app.reports.constants import investment_thesis_prompt

from anyio.streams.memory import MemoryObjectSendStream


# import logging
# import sys

# logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
# logging.getLogger().addHandler(logging.StreamHandler(stream=sys.stdout))


# TODO: add metadata filtering
def quantitative_question_engine(input: str, service_context: ServiceContext) -> str:
    """A query engine that can answer quantitative questions about a set of SEC financial documents that the user pre-selected for the conversation.
    Any questions about company-related financials or other metrics should be asked here.
    """
    index = VectorStoreIndex.from_vector_store(
        vector_store=get_vector_store(),
        service_context=service_context,
    )
    # index = load_index_from_storage(
    #     storage_context=storage_context, service_context=service_context
    # )
    # filters = MetadataFilters(filters=[ExactMatchFilter(key=key, value=value)])
    # retriever = index.as_retriever(filters=filters)
    # response = retriever.retrieve(input)
    query_engine = index.as_query_engine(similarity_top_k=3)
    response = query_engine.query(input)
    return response


def qualitative_question_engine(input: str, service_context: ServiceContext) -> str:
    """A query engine that can answer qualitative questions about a set of SEC financial documents that the user pre-selected for the conversation.
    Any questions about company-related headwinds, tailwinds, risks, sentiments, or administrative information should be asked here.
    """
    index = VectorStoreIndex.from_vector_store(
        vector_store=get_vector_store(),
        service_context=service_context,
    )
    # index = load_index_from_storage(
    #     storage_context=storage_context, service_context=service_context
    # )
    # filters = MetadataFilters(filters=[ExactMatchFilter(key=key, value=value)])
    # retriever = index.as_retriever(filters=filters)
    # response = retriever.retrieve(input)
    query_engine = index.as_query_engine(similarity_top_k=3)
    response = query_engine.query(input)
    return response


def get_available_docs(cik: str):
    docs = service_client.table("documents").select("*").eq("cik", cik).execute()
    return docs.data


def doc_to_query_engine(doc_id: str, service_context: ServiceContext):
    index = VectorStoreIndex.from_vector_store(
        vector_store=get_vector_store(),
        service_context=service_context,
    )
    filters = MetadataFilters(
        filters=[ExactMatchFilter(key="db_document_id", value=doc_id)]
    )
    # return index.as_query_engine(filters=filters)
    return CitationQueryEngine.from_args(
        index,
        similarity_top_k=3,
        # here we can control how granular citation sources are, the default is 512
        citation_chunk_size=512,
    )


def build_description_for_document(doc):
    time_period = (
        f"{doc['year']} Q{doc['quarter']}" if doc["quarter"] else str(doc["year"])
    )
    return f"A SEC {doc['doc_type']} filing describing the financials of {doc['company_name']} for the {time_period} time period."


class ReportCallbackHandler(BaseCallbackHandler):
    def __init__(
        self,
    ):
        """Initialize the base callback handler."""
        # ignored_events = [CBEventType.CHUNKING, CBEventType.NODE_PARSING]
        ignored_events = []
        self.event_starts_to_ignore = ignored_events
        self.event_ends_to_ignore = ignored_events
        # super().__init__(
        #     event_starts_to_ignore=ignored_events, event_ends_to_ignore=ignored_events
        # )

    def on_event_start(
        self,
        event_type: CBEventType,
        payload: Optional[Dict[str, Any]] = None,
        event_id: str = "",
        **kwargs: Any,
    ) -> str:
        ...
        print(f"Event started: {event_type}")
        # print("on event start")
        # print(event_type)
        # print(payload)

    def on_event_end(
        self,
        event_type: CBEventType,
        payload: Dict[str, Any],
        event_id: str = "",
        **kwargs: Any,
    ) -> str:
        print(f"Event ended: {event_type}")
        if event_type == CBEventType.RETRIEVE:
            print(payload[EventPayload.NODES])

    async def async_on_event(
        self,
        event_type: CBEventType,
        payload: Dict[str, Any],
        event_id: str = "",
        is_start_event: bool = False,
        **kwargs: Any,
    ):
        print(f"Async on event: {event_type}")

    def start_trace(self, trace_id: Optional[str] = None) -> None:
        """No-op."""

    def end_trace(
        self,
        trace_id: Optional[str] = None,
        trace_map: Optional[Dict[str, List[str]]] = None,
    ) -> None:
        """No-op."""


def get_reports_engine(prompt: str, cik: str):

    callback_handler = ReportCallbackHandler()
    rag_service_context = get_rag_service_context([callback_handler])
    subquestion_service_context = get_service_context([callback_handler])
    agent_service_context = get_service_context([callback_handler])

    docs = get_available_docs(cik)

    vector_query_engine_tools = [
        QueryEngineTool(
            query_engine=doc_to_query_engine(doc["id"], rag_service_context),
            metadata=ToolMetadata(
                name=doc["id"], description=build_description_for_document(doc)
            ),
        )
        for doc in docs
    ]

    qualitative_question_engine = SubQuestionQueryEngine.from_defaults(
        query_engine_tools=vector_query_engine_tools,
        service_context=subquestion_service_context,
        verbose=settings.VERBOSE,
        use_async=False,
    )

    quantitative_question_engine = SubQuestionQueryEngine.from_defaults(
        query_engine_tools=vector_query_engine_tools,
        service_context=subquestion_service_context,
        verbose=settings.VERBOSE,
        use_async=False,
    )

    # quantitative_question_engine_tool = FunctionTool.from_defaults(
    #     fn=quantitative_question_engine
    # )
    # qualitative_question_engine_tool = FunctionTool.from_defaults(
    #     fn=qualitative_question_engine
    # )

    top_level_sub_tools = [
        QueryEngineTool(
            query_engine=qualitative_question_engine,
            metadata=ToolMetadata(
                name="qualitative_question_engine",
                description="""
        A query engine that can answer qualitative questions about a set of SEC financial documents that the user pre-selected for the conversation.
        Any questions about company-related headwinds, tailwinds, risks, sentiments, or administrative information should be asked here.
        """.strip(),
            ),
        ),
        QueryEngineTool(
            query_engine=quantitative_question_engine,
            metadata=ToolMetadata(
                name="quantitative_question_engine",
                description="""
        A query engine that can answer quantitative questions about a set of SEC financial documents that the user pre-selected for the conversation.
        Any questions about company-related financials or other metrics should be asked here.
        """.strip(),
            ),
        ),
    ]

    # llm = Anthropic(
    #     temperature=0,
    #     # model="claude-3-opus-20240229",
    #     model="claude-3-haiku-20240307",
    #     api_key=settings.ANTHROPIC_API_KEY,
    # )
    # agent = ReActAgent.from_tools(
    #     top_level_sub_tools,
    #     llm=llm,
    #     verbose=True,
    # )
    chat_llm = OpenAI(
        api_key=settings.OPENAI_API_KEY,
        model="gpt-3.5-turbo",
        temperature=0,
    )
    agent = OpenAIAgent.from_tools(
        tools=top_level_sub_tools,
        llm=chat_llm,
        verbose=True,
    )
    response = agent.chat(prompt)
    print(response)


get_reports_engine(investment_thesis_prompt.format(company="Apple"), "0000320193")
