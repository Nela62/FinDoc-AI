import { ViewPdf } from '@/components/pdf-viewer/ViewPdf';
import { useBoundStore } from '@/providers/store-provider';

export const InspectCitation = () => {
  const {
    documentId,
    documents,
    selectedCitationSourceNum,
    setDocumentId,
    citations,
  } = useBoundStore((state) => state);

  if (selectedCitationSourceNum && !documentId) {
    setDocumentId(
      citations.find((c) => c.source_num === selectedCitationSourceNum)
        ?.doc_id || '',
    );
  }

  const doc = documents.find((doc) => doc.id === documentId);

  if (!doc) {
    return <p>Document not found</p>;
  }

  return <ViewPdf file={doc} />;
};
