from llama_index.vector_stores.supabase import SupabaseVectorStore

from typing import Dict, Any, Optional, List
from llama_index.core import (
    StorageContext,
    ServiceContext,
    load_index_from_storage,
    VectorStoreIndex,
)
import json
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

from llama_index.llms.anthropic import Anthropic
from llama_index.core.vector_stores import ExactMatchFilter, MetadataFilters
from app.core.config import settings
from app.schema import SecDocumentMetadata
from app.reports.constants import investment_thesis_prompt
from llama_index.postprocessor.cohere_rerank import CohereRerank
from anyio.streams.memory import MemoryObjectSendStream

from llama_index.core.schema import NodeWithScore, MetadataMode

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
    docs = (
        service_client.table("documents")
        .select("*")
        .eq("cik", cik)
        .eq("year", 2023)
        .eq("doc_type", "10-K")
        .execute()
    )
    return docs.data


def get_nodes(doc_id: str, service_context: ServiceContext):
    index = VectorStoreIndex.from_vector_store(
        vector_store=get_vector_store(),
        service_context=service_context,
    )
    filters = MetadataFilters(
        filters=[ExactMatchFilter(key="db_document_id", value=doc_id)]
    )

    return index.as_retriever(filters=filters, similarity_top_k=10)


def process_nodes(nodes: List[NodeWithScore], query: str):
    cohere_rerank = CohereRerank(api_key=settings.COHERE_API_KEY, top_n=2)

    return cohere_rerank.postprocess_nodes(nodes=nodes, query_str=query)


def get_reports_engine(cik: str):
    docs = get_available_docs(cik)
    retriever = get_nodes(docs[0]["id"], get_rag_service_context())

    prompts = [
        "primary business, industry, and key products/services",
        "Breakdown of revenue by business segment",
        "Key brands, subsidiaries or business units",
        "High-level financial metrics like total revenue",
        "Geographic markets served",
        "key facts like founding date, pioneering a new industry/technology, or major acquisitions",
    ]

    starting_citation_num = 1
    citation_num = starting_citation_num
    context = ""
    nodes = []

    for prompt in prompts:
        for node in process_nodes(retriever.retrieve(prompt), prompt):
            print(node.id_)
            exists = [n for n in nodes if n["node_id"] == node.id_]
            print(exists)
            if len(exists) > 0:
                continue
            # TODO: fetch data only for the used nodes
            # TODO: when appending nodes, make sure there are no duplicates
            data = (
                service_client.table("documents")
                .select("*")
                .eq("id", node.node.extra_info["db_document_id"])
                .execute()
            )
            parent_doc = data.data[0]
            nodes.append(
                {
                    "node_id": node.id_,
                    "text": node.get_text(),
                    "source_num": citation_num,
                    "page": node.node.extra_info["page_label"],
                    "url": parent_doc["url"],
                    "doc_type": parent_doc["doc_type"],
                    "company_name": parent_doc["company_name"],
                    "company_ticker": parent_doc["company_ticker"],
                    "year": parent_doc["year"],
                    # TODO: when null is returned from db, convert it to None
                    "quarter": (
                        None
                        if parent_doc["quarter"] == "null"
                        else parent_doc["quarter"]
                    ),
                }
            )
            context += f"""<source><source_number>{citation_num}</source_number><source_content>{node.get_text()}</source_content></source>\n"""
            citation_num += 1

    prompt = """Please provide an answer based solely on the provided sources. \
    When referencing information from a source, cite the appropriate source(s) using their corresponding numbers. \
    Every answer should include at least one source citation. \
    Only cite a source when you are explicitly referencing it. \
    If none of the sources are helpful, you should indicate that. \
    <example><sources><source><source_number>1</source_number><source_content><The sky is red in the evening and blue in the morning./source_content></source> \
    <source><source_number>2</source_number><source_content>Water is wet when the sky is red.</source_content></source></sources> \
    <query>When is water wet?</query>
    <answer>Water will be wet when the sky is red [2], \n
    which occurs in the evening [1].</answer>
    </example>
    Now it's your turn. Below are several numbered sources of information:
    <context>{context}</context>\n
    <query>{query}</query>
    Answer: """

    business_description_query = """You are an exceptional financial analyst who is writing an equity research report. \
Write a concise 3-4 sentence business description of the given company, including the following information: \
- The company's primary business, industry, and key products/services \
- Breakdown of revenue by business segment in percentages \
- Key brands, subsidiaries or business units \
- High-level financial metrics like total revenue \
- Geographic markets served \
- Any other key facts like founding date, pioneering a new industry/technology, or major acquisitions \
Write the description in an objective, matter-of-fact tone. Use the most recent available data. \

Here is an example of a good business description: 
<example>Amazon, founded in 1994, is a multinational technology company primarily operating in the e-commerce, cloud computing, and artificial intelligence industries. The company's key products and services include online retail, Amazon Web Services (AWS), and digital streaming, with revenue breakdown of 50% from online stores, 33% from third-party seller services, 13% from AWS, and 4% from other sources, as of 2021. Amazon's major subsidiaries include Whole Foods Market, Ring, and Twitch, serving customers worldwide. In 2021, Amazon reported total net sales of $469.8 billion, a 22% increase from the previous year, solidifying its position as a global leader in the e-commerce industry.</example>

Keep the writing style and length as similar as possible to the example provided.

Company name: {company} \
"""

    llm = Anthropic(
        temperature=0,
        model="claude-3-opus-20240229",
        # model="claude-3-sonnet-20240229",
        # model="claude-3-haiku-20240307",
        api_key=settings.ANTHROPIC_API_KEY,
    )
    res = llm.complete(
        prompt.format(
            context=context,
            query=business_description_query.format(company=docs[0]["company_name"]),
        )
    )
    return {"text": res.text, "nodes": nodes}


# get_reports_engine("0000320193")
