import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDocxGenerator } from '@/hooks/useDocxGenerator';
import {
  fetchReportById,
  fetchTemplateConfig,
  getApiCacheByReportId,
} from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { getFinancialAndRiskAnalysisMetrics } from '@/lib/utils/metrics/financialAndRiskAnalysisMetrics';
import { getGrowthAndValuationAnalysisMetrics } from '@/lib/utils/metrics/growthAndValuationAnalysisMetrics';
import { getSidebarMetrics } from '@/lib/utils/metrics/sidebarMetrics';
import { getNWeeksStock } from '@/lib/utils/metrics/stock';
import { getTopBarMetrics } from '@/lib/utils/metrics/topBarMetrics';
import { useBoundStore } from '@/providers/store-provider';
import { DailyStockData, Overview } from '@/types/alphaVantageApi';
import { SubscriptionPlan } from '@/types/subscription';
import {
  useQuery,
  useUpdateMutation,
} from '@supabase-cache-helpers/postgrest-react-query';
import { format } from 'date-fns';
import { Loader2Icon } from 'lucide-react';
import { useLogger } from 'next-axiom';
import { useCallback, useMemo, useState } from 'react';

type ReportInfoType = {
  title: string;
  value: string;
};

export const ReportInfo = ({
  reportId,
  userId,
  plan,
}: {
  reportId: string;
  userId: string;
  plan: SubscriptionPlan;
}) => {
  const [isLoading, setLoading] = useState(false);
  const { initGeneration } = useBoundStore((state) => state);

  const log = useLogger();

  const supabase = createClient();

  const { data: report } = useQuery(fetchReportById(supabase, reportId));

  const { mutateAsync: updateReport } = useUpdateMutation(
    supabase.from('reports'),
    ['id'],
    'id',
  );

  const { data: templateConfig } = useQuery(
    fetchTemplateConfig(supabase, reportId),
  );

  const { data: cache } = useQuery(getApiCacheByReportId(supabase, reportId));

  const { mutateAsync: updateTemplateConfig } = useUpdateMutation(
    supabase.from('report_template'),
    ['id'],
    'id',
  );

  const { docxFile: docxFileData, pdfFile: pdfFileData } = useDocxGenerator(
    userId,
    reportId,
  );

  const updateTemplate = useCallback(async () => {
    if (!report || !templateConfig || !cache) return;

    setLoading(true);

    const { yfAnnual, yfQuarterly } = await fetch(
      `/api/metrics/${report.company_ticker}`,
    )
      .then((res) => res.ok && res.json())
      .catch((err) => console.error(err));

    const overview = cache.overview as Overview;
    const dailyStock = cache.stock as DailyStockData;

    const topBarMetrics = getTopBarMetrics(
      overview,
      report.targetprice || 182,
      getNWeeksStock(dailyStock),
      yfQuarterly,
    );

    // Generate metrics
    const sidebarMetrics = getSidebarMetrics(
      overview,
      getNWeeksStock(dailyStock),
      report.targetprice || 182,
      report.financial_strength || 'HIGH',
      yfQuarterly,
    );
    const growthAndValuationAnalysisMetrics =
      getGrowthAndValuationAnalysisMetrics(yfAnnual, dailyStock);
    const financialAndRiskAnalysisMetrics =
      getFinancialAndRiskAnalysisMetrics(yfAnnual);

    await updateReport({
      id: report.id,
      updated_at: new Date().toISOString().toLocaleString(),
    });

    await updateTemplateConfig({
      id: templateConfig.id,
      metrics: {
        // @ts-ignore
        sources: templateConfig.metrics?.sources ?? [],
        sidebarMetrics,
        growthAndValuationAnalysisMetrics,
        financialAndRiskAnalysisMetrics,
        topBarMetrics,
      },
    });
    setLoading(false);
    initGeneration();
  }, [
    cache,
    report,
    updateReport,
    templateConfig,
    updateTemplateConfig,
    initGeneration,
  ]);

  const downloadPdf = async () => {
    if (!pdfFileData || !report) return;

    try {
      // Fetch the file content
      const response = await fetch(pdfFileData);
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = url;
      link.download = report.title || 'report.pdf'; // Set the file name

      // Append to the document, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release the temporary URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      log.error('Could not download PDF', {
        error: error instanceof Error ? error.message : '',
        ...report,
      });
      // Handle the error (e.g., show an error message to the user)
    }
    // const link = document.createElement('a');
    // link.href = pdfFileData;
    // link.target = '_blank'; // Open the link in a new tab
    // link.rel = 'noopener noreferrer'; // Recommended for security reasons
    // link.download = report.title;
    // link.click();
    // URL.revokeObjectURL(pdfFileData);
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
        value: format(report.created_at, 'd MMMM yyyy, h:mm:ss a'),
      },
      {
        title: 'Last Updated',
        value: format(report.updated_at, 'd MMMM yyyy, h:mm:ss a'),
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
    <div className="flex flex-col gap-4">
      <div className="h-[41px] border-b w-full px-8 flex gap-2 items-center bg-white">
        {/* <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger className="grow" disabled> */}
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={updateTemplate}
          disabled={isLoading}
        >
          {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
          Update
        </Button>
        {/* </TooltipTrigger>
                  <TooltipContent>
                    <p>Your plan doesn&apos;t support this feature.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider> */}
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger
              asChild
              className="grow disabled:pointer-events-auto"
            >
              <Button
                size="sm"
                variant="outline"
                className={cn('w-full', 'cursor-not-allowed')}
                onClick={downloadDocx}
                // disabled={!report || !templateConfig || !docxFileData}
                disabled
              >
                Download DOCX
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Your plan doesn&apos;t support this feature.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          size="sm"
          variant="outline"
          className="grow"
          onClick={downloadPdf}
          disabled={!report || !templateConfig || !pdfFileData}
        >
          Download PDF
        </Button>
      </div>
      <h2 className="font-semibold text-primary/80 px-8">Report Info</h2>
      <div className="flex flex-col w-full px-8 gap-6">
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
