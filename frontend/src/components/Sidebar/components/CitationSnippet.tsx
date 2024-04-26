import { useBoundStore } from '@/providers/store-provider';
import { useMemo } from 'react';

import { IconFileTypePdf } from '@tabler/icons-react';
import { Expand } from 'lucide-react';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { fetchDocuments } from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import { usePathname } from 'next/navigation';
import { Citation } from '@/types/citation';

// TODO: handle long text wrapping
export const CitationSnippet = ({ citation }: { citation: Citation }) => {
  const { setCitation } = useBoundStore((state) => state);
  const pathname = usePathname();

  const supabase = createClient();
  const { data, error } = useQuery(
    fetchDocuments(supabase, pathname.split('/').pop() as string),
  );

  const doc = useMemo(() => {
    if (data && data.length > 0) {
      return data.find((d) => d.documents?.id === citation.doc_id)?.documents;
    } else return null;
  }, [data, citation.doc_id]);

  if (!doc || !citation) {
    return null;
  }

  return (
    <button
      className="flex gap-2 border-b-[0.5px] border-zinc-300 px-3 text-sm py-3 text-left"
      onClick={() => {
        setCitation(citation.source_num);
      }}
    >
      <p className="text-zinc-600">{`[${citation.source_num}]`}</p>
      <div className="flex flex-col">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <p className="text-zinc-600 font-medium text-xs">
              {`${doc.company_name} (${doc.company_ticker})`}
            </p>
            <p className="text-zinc-600 font-medium text-xs">{`${
              doc.doc_type
            } ${
              doc.doc_type === '10-K' ? doc.year : `${doc.quarter} ${doc.year}`
            } - Page ${citation.page}`}</p>
          </div>

          <div className="flex gap-1">
            <IconFileTypePdf stroke={2} className="w-4 h-4 text-zinc-500" />
            <Expand className="w-4 h-4 text-zinc-500" />
          </div>
        </div>
        {/* TODO: install a package to limit text to three lines only */}
        <p className="text-xs mt-1 text-zinc-400 italic">
          {`"${citation.text.slice(0, 141)}..."`}
        </p>
      </div>
    </button>
  );
};
