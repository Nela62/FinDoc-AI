from typing import List
from tempfile import TemporaryDirectory
import download_sec_filings
from fire import Fire
from download_sec_filings import DEFAULT_CIKS, DEFAULT_FILING_TYPES


def upload_public_documents_to_storage(
    ciks: List[str] = DEFAULT_CIKS, filing_types: List[str] = DEFAULT_FILING_TYPES
):
    with TemporaryDirectory() as temp_dir:
        print(f"Downloading SEC filings")
        download_sec_filings.main(
            output_dir=temp_dir, ciks=ciks, file_types=filing_types
        )

    return


def main(public: bool = True):
    if public:
        upload_public_documents_to_storage()

    # get vector embeddings for each document

    # upload vector embeddings to Supabase vector store
    return


if __name__ == "__main__":
    Fire(main)
