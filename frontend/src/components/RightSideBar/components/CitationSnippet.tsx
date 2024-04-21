import { useBoundStore } from '@/providers/store-provider';
import { useMemo } from 'react';

import { IconFileTypePdf } from '@tabler/icons-react';
import { Expand } from 'lucide-react';
import { DocumentType } from '@/stores/documents-store';
import { Citation } from '@/stores/citations-store';

// TODO: handle long text wrapping
export const CitationSnippet = ({ citation }: { citation: Citation }) => {
  const { citations, documents, documentId, setCitation } = useBoundStore(
    (state) => state,
  );

  const doc = useMemo(
    () => documents.find((doc) => doc.id === documentId),
    [documentId, documents],
  );

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
              doc.doc_type === DocumentType.TenK
                ? doc.year
                : `${doc.quarter} ${doc.year}`
            } - Page ${citation.page}`}</p>
          </div>

          <div className="flex gap-1">
            <IconFileTypePdf stroke={2} className="w-4 h-4 text-zinc-500" />
            <Expand className="w-4 h-4 text-zinc-500" />
          </div>
        </div>
        {/* TODO: install a package to limit text to three lines only */}
        <p className="text-xs mt-1 text-zinc-400 font-medium italic">
          {`"${citation.text.slice(0, 141)}..."`}
        </p>
      </div>
    </button>
  );
};
