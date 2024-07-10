import { Button } from '@/components/ui/button';
import { useDocxGenerator } from '@/hooks/useDocxGenerator';
import {
  fetchReportById,
  fetchTemplateConfig,
  getApiCacheByReportId,
} from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
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
    <div className="w-[360px] py-4">
      <div className="sr-only" id="hidden-container"></div>
      <div className="flex w-full justify-between">
        <Button variant="outline" onClick={updateTemplate} disabled={isLoading}>
          {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
          Update
        </Button>
        {plan !== 'free' && plan !== 'starter' && (
          <Button
            variant="outline"
            onClick={downloadDocx}
            disabled={!report || !templateConfig || !docxFileData}
          >
            Download docx
          </Button>
        )}
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
