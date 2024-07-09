import { ViewPdf } from '@/components/pdf-viewer/ViewPdf';
// import { fetchDocumentById, fetchDocuments } from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import { useBoundStore } from '@/providers/store-provider';
import { Document } from '@/types/document';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';

export const InspectCitation = () => {
  const { documentId, citationSnippetId } = useBoundStore((state) => state);

  const url = window.location.pathname.split('/')[2];
  const supabase = createClient();
  // const { data: document, error } = useQuery(
  //   fetchDocumentById(supabase, documentId ?? ''),
  // );

  if (!document) {
    return <p>Document not found</p>;
  }

  // const doc: Document = document[0];
  return <div></div>;

  // return <ViewPdf file={doc} />;
};
