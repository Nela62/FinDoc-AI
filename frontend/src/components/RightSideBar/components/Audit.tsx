import { useBoundStore } from '@/providers/store-provider';
import { Citation } from '@/stores/citations-store';
import { IconFileTypePdf } from '@tabler/icons-react';
import { Expand } from 'lucide-react';

export const Audit = () => {
  const { citations, setSelectedCitation } = useBoundStore((state) => state);

  const CitationComponent = ({ citation }: { citation: Citation }) => {
    return (
      <button
        className="flex gap-2 border-b-[0.5px] border-zinc-300 px-3 text-sm py-3 text-left"
        onClick={() => {
          setSelectedCitation(citation.source_num);
        }}
      >
        <p className="text-zinc-600">{`[${citation.source_num}]`}</p>
        <div className="flex flex-col">
          <div className="flex justify-between">
            <div className="flex flex-col">
              <p className="text-zinc-600 font-medium text-xs">
                {citation.company_name}
              </p>
              <p className="text-zinc-600 font-medium text-xs">{`${
                citation.doc_type
              } ${
                citation.doc_type === '10-K'
                  ? citation.year
                  : `${citation.quarter} ${citation.year}`
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
  return (
    <>
      {citations.map((citation) => (
        <CitationComponent key={citation.node_id} citation={citation} />
      ))}
    </>
  );
};
