import { useBoundStore } from '@/providers/store-provider';

export const InspectCitation = () => {
  const { selectedCitation } = useBoundStore((state) => state);

  return (
    <div>
      <p>{selectedCitation?.source_num}</p>
    </div>
  );
};
