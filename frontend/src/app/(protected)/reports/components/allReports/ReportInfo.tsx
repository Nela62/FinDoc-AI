import { Button } from '@/components/ui/button';
import {
  fetchAPICacheByReportId,
  fetchReportById,
  fetchTemplateConfig,
} from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { useFileUrl } from '@supabase-cache-helpers/storage-react-query';

export const ReportInfo = ({
  reportId,
  userId,
}: {
  reportId: string;
  userId: string;
}) => {
  const supabase = createClient();

  const { data: report } = useQuery(fetchReportById(supabase, reportId));
  const { data: templateConfig } = useQuery(
    fetchTemplateConfig(supabase, reportId),
  );

  const { data: docxFileData } = useFileUrl(
    supabase.storage.from('saved-templates'),
    `${userId}/${templateConfig?.id}/docx`,
    'private',
    {
      refetchOnWindowFocus: false,
      enabled: !!templateConfig,
    },
  );

  const { data: pdfFileData } = useFileUrl(
    supabase.storage.from('saved-templates'),
    `${userId}/${templateConfig?.id}/pdf`,
    'private',
    {
      refetchOnWindowFocus: false,
      enabled: !!templateConfig,
    },
  );

  const downloadPdf = () => {
    if (!pdfFileData || !report) return;
    const link = document.createElement('a');
    link.href = pdfFileData;
    link.download = report.title;
    link.click();
    URL.revokeObjectURL(pdfFileData);
  };

  const downloadDocx = () => {
    if (!docxFileData || !report) return;
    const link = document.createElement('a');
    link.href = docxFileData;
    link.download = report.title;
    link.click();
    URL.revokeObjectURL(docxFileData);
  };

  return (
    <div className="w-[360px] py-4">
      <div className="sr-only" id="hidden-container"></div>
      <div className="flex w-full justify-between">
        <Button variant="outline">Update</Button>
        <Button
          variant="outline"
          onClick={downloadDocx}
          disabled={!report || !templateConfig || !docxFileData}
        >
          Download docx
        </Button>
        <Button
          variant="outline"
          onClick={downloadPdf}
          disabled={!report || !templateConfig || !pdfFileData}
        >
          Download pdf
        </Button>
      </div>
    </div>
  );
};
