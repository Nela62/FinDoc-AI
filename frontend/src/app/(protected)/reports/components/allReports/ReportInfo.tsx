import { Button } from '@/components/ui/button';
import {
  fetchAPICacheByReportId,
  fetchReportById,
  fetchTemplateConfig,
} from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { useFileUrl } from '@supabase-cache-helpers/storage-react-query';
import { format } from 'date-fns';
import { useCallback, useMemo } from 'react';

type ReportInfoType = {
  title: string;
  value: string;
};

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
    link.target = '_blank'; // Open the link in a new tab
    link.rel = 'noopener noreferrer'; // Recommended for security reasons
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

  const getReportInfo = useMemo(() => {
    if (!report) return [];
    const info: ReportInfoType[] = [
      {
        title: 'Company Name',
        value: report.companies?.stock_name.split(' - ')[0] ?? 'NULL',
      },
      { title: 'Ticker', value: report.company_ticker },
      { title: 'Stock Name', value: report.companies?.stock_name ?? 'NULL' },
      { title: 'Report Type', value: report.type },
      {
        title: 'Date Created',
        value: format(report.created_at, 'd MMMM yyyy, h:m:s a'),
      },
      {
        title: 'Last Updated',
        value: format(report.updated_at, 'd MMMM yyyy, h:m:s a'),
      },
      { title: 'Recommendation', value: report.recommendation ?? '' },
      { title: 'Target Price', value: report.targetprice?.toString() ?? '' },
      { title: 'Financial Strength', value: report.financial_strength ?? '' },
      { title: 'CIK', value: report.companies?.cik ?? 'NULL' },
      { title: 'ISIN', value: report.companies?.isin ?? 'NULL' },
      { title: 'Exchange', value: report.companies?.exchange ?? 'NULL' },
      { title: 'Currency', value: report.companies?.currency ?? 'NULL' },
      { title: 'Country', value: report.companies?.country ?? 'NULL' },
      { title: 'Market Cap', value: report.companies?.market_cap ?? 'NULL' },
      { title: 'Website', value: report.companies?.website ?? 'NULL' },
    ];
    return info;
  }, [report]);

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
      <div className="flex flex-col w-full mt-8 gap-6">
        {getReportInfo
          ? getReportInfo.map((row: ReportInfoType) => (
              <div key={row.title} className="flex items-center">
                <p className="w-1/2 font-semibold text-sm text-primary/80">
                  {row.title}
                </p>
                <p className="w-1/2 text-sm text-primary/70">{row.value}</p>
              </div>
            ))
          : []}
      </div>
    </div>
  );
};
