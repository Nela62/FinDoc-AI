import { ViewPdf } from '@/components/pdf-viewer/ViewPdf';
import { useBoundStore } from '@/providers/store-provider';

export const InspectCitation = () => {
  const { selectedCitation, documentId, documents } = useBoundStore(
    (state) => state,
  );
  const doc = documents.find((doc) => doc.id === documentId);

  if (!doc) return <div>Document not found</div>;
  return <ViewPdf file={doc} />;
};
