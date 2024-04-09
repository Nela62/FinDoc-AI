import { useBoundStore } from '@/providers/store-provider';
import { Citation } from '@/stores/citations-store';

const CitationComponent = ({ citation }: { citation: Citation }) => {
  return (
    <div className="flex gap-2 h-full px-3 text-sm">
      <p>{`[${citation.source_num}]`}</p>
      <p>{citation.text.slice(0, 141)}</p>
    </div>
  );
};

export const Audit = () => {
  const { citations } = useBoundStore((state) => state);
  return (
    <>
      {citations.map((citation) => (
        <CitationComponent key={citation.node_id} citation={citation} />
      ))}
    </>
  );
};
