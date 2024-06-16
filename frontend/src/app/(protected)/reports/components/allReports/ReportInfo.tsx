import { Button } from '@/components/ui/button';
import { useDocxGenerator } from '@/hooks/useDocxGenerator';
import {
  fetchAPICacheByReportId,
  fetchReportById,
  fetchTemplateConfig,
} from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import { Json } from '@/lib/supabase/database.types';
import {
  getFinancialAndRiskAnalysisMetrics,
  getGrowthAndValuationAnalysisMetrics,
  getNWeeksStock,
  getSidebarMetrics,
  getTopBarMetrics,
} from '@/lib/utils/financialAPI';
import { useBoundStore } from '@/providers/store-provider';
import {
  useQuery,
  useUpdateMutation,
  useUpsertMutation,
} from '@supabase-cache-helpers/postgrest-react-query';
import { format } from 'date-fns';
import { useCallback, useMemo, useState } from 'react';

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

  const { mutateAsync: updateTemplateConfig } = useUpdateMutation(
    supabase.from('report_template'),
    ['id'],
    'id',
  );

  const { docxFile: docxFileData, pdfFile: pdfFileData } = useDocxGenerator(
    userId,
    reportId,
  );

  const { data: apiCache } = useQuery(
    fetchAPICacheByReportId(supabase, reportId),
  );

  const { mutateAsync: updateApiCache } = useUpsertMutation(
    supabase.from('api_cache'),
    ['id'],
    'id',
  );

  const updateTemplate = useCallback(() => {
    if (!apiCache || !report || !templateConfig) return;

    setLoading(true);

    const newCache:
      | {
          accessed_at?: string | undefined;
          api_provider: string;
          endpoint: string;
          id?: string | undefined;
          json_data: Json;
          report_id: string;
          user_id: string;
        }[]
      | {
          json_data: any;
          accessed_at: string;
          id: string;
          endpoint: string;
          api_provider: string;
          user_id: string;
          report_id: string;
        }[] = [];

    Promise.all(
      apiCache.map(async (row) => {
        const res = await fetch(
          row.endpoint +
            '&apikey=' +
            process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY,
        );
        const json = await res.json();
        newCache.push({
          ...row,
          json_data: json,
          accessed_at: new Date().toISOString().toLocaleString(),
        });
      }),
    ).then(async () => {
      const overview = newCache.find((p) =>
        p.endpoint.includes('OVERVIEW'),
      )?.json_data;
      const dailyStock = newCache.find((p) =>
        p.endpoint.includes('TIME_SERIES_DAILY'),
      )?.json_data;
      const balanceSheet = newCache.find((p) =>
        p.endpoint.includes('BALANCE_SHEET'),
      )?.json_data;
      const incomeStatement = newCache.find((p) =>
        p.endpoint.includes('INCOME_STATEMENT'),
      )?.json_data;
      const cashflow = newCache.find((p) =>
        p.endpoint.includes('CASH_FLOW'),
      )?.json_data;
      const earnings = newCache.find((p) =>
        p.endpoint.includes('EARNINGS'),
      )?.json_data;

      const topBarMetrics = getTopBarMetrics(
        overview,
        report.targetprice || 182,
        getNWeeksStock(dailyStock),
      );

      // Generate metrics
      const sidebarMetrics = getSidebarMetrics(
        overview,
        balanceSheet,
        incomeStatement,
        getNWeeksStock(dailyStock),
        report.targetprice || 182,
        report.financial_strength || 'HIGH',
      );
      const growthAndValuationAnalysisMetrics =
        getGrowthAndValuationAnalysisMetrics(
          balanceSheet,
          cashflow,
          incomeStatement,
          earnings,
          dailyStock,
        );
      const financialAndRiskAnalysisMetrics =
        getFinancialAndRiskAnalysisMetrics(
          balanceSheet,
          cashflow,
          incomeStatement,
        );

      await updateApiCache(newCache);
      await updateReport({
        id: report.id,
        updated_at: new Date().toISOString().toLocaleString(),
      });
      console.log(templateConfig.metrics);
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
    });
  }, [
    apiCache,
    updateApiCache,
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
          Update
        </Button>
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
