import { useBoundStore } from '@/providers/store-provider';
import { Citation } from '@/stores/citations-store';
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
        <p className="text-xs text-zinc-400 font-medium italic">
          {`"${citation.text.slice(0, 141)}..."`}
        </p>
        <div>
          <Expand className="w-3 h-3 text-zinc-400" />
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
