import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import {
  fetchCitationSnippets,
  fetchCitedDocuments,
  fetchDocuments,
} from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import {
  type CitationSnippet,
  type CitationType,
  type CitedDocument as CitedDocumentType,
} from '@/types/citation';
import { CitedDocument } from './citations/CitedDocument';

export const Audit = ({ reportId }: { reportId: string }) => {
  const supabase = createClient();

  const { data: fetchedCitedDocuments } = useQuery(
    fetchCitedDocuments(supabase, reportId),
  );

  const { data: fetchedCitationSnippets } = useQuery(
    fetchCitationSnippets(supabase, reportId),
  );

  const { data: documents, error } = useQuery(fetchDocuments(supabase));

  if (!fetchedCitedDocuments || !fetchedCitationSnippets) {
    // console.log(fetchedCitedDocuments);
    // return <p>No data found</p>;
    return;
  }

  const citedDocuments: CitedDocumentType[] = fetchedCitedDocuments.map(
    (doc) => ({
      id: doc.id,
      sourceNum: doc.source_num,
      topTitle: doc.top_title,
      bottomTitle: doc.bottom_title ?? '',
      citationType: doc.citation_type as CitationType,
      lastRefreshed: new Date(doc.last_refreshed),
      docId: doc.doc_id,
    }),
  );

  const citationSnippets: CitationSnippet[] = fetchedCitationSnippets.map(
    (snippet) => ({
      id: snippet.id,
      citedDocumentId: snippet.cited_documents
        ? snippet.cited_documents.id
        : '',
      sourceNum: snippet.source_num,
      title: snippet.title,
      textSnippet: snippet.text_snippet,
    }),
  );

  return (
    <>
      <p className="italic mt-3 font-semibold text-xs text-center text-zinc-500">
        {/* TODO: add filters and change to displaying num out of num citations when filtered */}
        {citedDocuments.length === 0
          ? 'No citations to display'
          : `Displaying all ${citationSnippets.length} citations`}
      </p>
      {citedDocuments &&
        citationSnippets &&
        citedDocuments
          .sort((a, b) => a.sourceNum - b.sourceNum)
          .map((doc) => (
            <CitedDocument
              key={doc.id}
              citedDocument={doc}
              citationSnippets={citationSnippets.filter(
                (citation) => citation.citedDocumentId === doc.id,
              )}
            />
          ))}
    </>
  );
};
