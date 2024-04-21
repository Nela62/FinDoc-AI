import { ViewPdf } from '@/components/pdf-viewer/ViewPdf';
import { useBoundStore } from '@/providers/store-provider';

export const InspectCitation = () => {
  const { documentId, documents } = useBoundStore((state) => state);

  const doc = documents.find((doc) => doc.id === documentId);

  if (!doc) {
    return <p>Document not found</p>;
  }

  return <ViewPdf file={doc} />;
};
