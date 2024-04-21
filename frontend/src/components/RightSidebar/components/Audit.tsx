import { useBoundStore } from '@/providers/store-provider';
import { CitationSnippet } from './CitationSnippet';

export const Audit = () => {
  const { citations } = useBoundStore((state) => state);
  return (
    <>
      <p className="italic mt-3 font-semibold text-xs text-center text-zinc-500">
        {/* TODO: add filters and change to displaying num out of num citations when filtered */}
        {citations.length === 0
          ? 'No citations to display'
          : `Displaying all ${citations.length} citations`}
      </p>
      {citations.map((citation) => (
        <CitationSnippet key={citation.node_id} citation={citation} />
      ))}
    </>
  );
};
