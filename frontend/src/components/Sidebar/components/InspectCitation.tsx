import { ViewPdf } from '@/components/pdf-viewer/ViewPdf';
import { fetchDocuments } from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import { useBoundStore } from '@/providers/store-provider';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';

export const InspectCitation = () => {
  const { documentId } = useBoundStore((state) => state);

  const url = window.location.pathname.split('/')[2];
  const supabase = createClient();
  const { data: documents, error } = useQuery(fetchDocuments(supabase, url));

  if (!documents) {
    return <p>Document not found</p>;
  }

  const doc = documents.find((doc) => doc.id === documentId);

  if (!doc) {
    return <p>Document not found</p>;
  }

  return <ViewPdf file={doc} />;
};
