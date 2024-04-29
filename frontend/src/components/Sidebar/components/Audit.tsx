import { CitationSnippet } from './CitationSnippet';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import {
  fetchCitations,
  fetchDocuments,
  getReportIdByUrl,
} from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import { usePathname } from 'next/navigation';

export const Audit = () => {
  const supabase = createClient();

  const pathname = usePathname();
  const url = pathname.split('/').pop() as string;

  const { data: report, error: reportError } = useQuery(
    getReportIdByUrl(supabase, url),
  );
  const { data: citations, error: citationsError } = useQuery(
    fetchCitations(supabase, report?.id ?? ''),
  );
  const { data: documents, error } = useQuery(
    fetchDocuments(supabase, report?.id ?? ''),
  );

  if (!citations || !report) {
    return;
  }

  return (
    <>
      <p className="italic mt-3 font-semibold text-xs text-center text-zinc-500">
        {/* TODO: add filters and change to displaying num out of num citations when filtered */}
        {citations.length === 0
          ? 'No citations to display'
          : `Displaying all ${citations.length} citations`}
      </p>
      {citations.map((citation) => (
        <CitationSnippet
          key={citation.node_id}
          citation={citation}
          documents={documents ?? []}
        />
      ))}
    </>
  );
};
