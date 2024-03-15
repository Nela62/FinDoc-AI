from typing import Dict, List, Optional
import logging
from pathlib import Path
from datetime import datetime
from tempfile import TemporaryDirectory

import requests
from llama_index.core.schema import Document as LlamaIndexDocument
from llama_index.readers.file import PDFReader

from app.chat.constants import (
    DB_DOC_ID_KEY,
    SYSTEM_MESSAGE,
    NODE_PARSER_CHUNK_OVERLAP,
    NODE_PARSER_CHUNK_SIZE,
)

from app.schema import (
    Message as MessageSchema,
    Document as DocumentSchema,
    Conversation as ConversationSchema,
    DocumentMetadataKeysEnum,
    SecDocumentMetadata,
)


def fetch_and_read_document(
    document: DocumentSchema,
) -> List[LlamaIndexDocument]:
    with TemporaryDirectory() as temp_dir:
        temp_file_path = Path(temp_dir) / f"{str(document.id)}.pdf"
        with open(temp_file_path, "wb") as temp_file:
            with requests.get(document.url, stream=True) as r:
                r.raise_for_status()
                for chunk in r.iter_content(chunk_size=8192):
                    temp_file.write(chunk)
            temp_file.seek(0)
            reader = PDFReader()
            return reader.load_data(
                temp_file_path, extra_info={DB_DOC_ID_KEY: str(document.id)}
            )
