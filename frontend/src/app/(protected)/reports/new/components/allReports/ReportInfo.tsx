import { Button } from '@/components/ui/button';
import {
  fetchAPICacheByReportId,
  fetchReportById,
  fetchTemplateConfig,
} from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { getDocxBlob } from '../../utils/getDocxBlob';
import { JSONContent } from '@tiptap/core';
import { FinancialStrength, Recommendation } from '@/types/report';
import {
  useDirectory,
  useFileUrl,
} from '@supabase-cache-helpers/storage-react-query';
import { useCallback, useEffect, useState } from 'react';
import { MarketDataChart } from '@/lib/templates/charts/MarketDataChart';
import { toPng } from 'html-to-image';
import {
  DailyStockData,
  Earnings,
  IncomeStatement,
} from '@/types/alphaVantageApi';
import { SidebarMetrics } from '@/lib/templates/metrics/components/statistics';
import { AnalysisMetrics } from '@/lib/templates/docxTables/financialAnalysisTable';

const defaultCompanyLogo = '/default_finpanel_logo.png';

type apiCacheData = {
  incomeStatement: IncomeStatement;
  earnings: Earnings;
  dailyStock: DailyStockData;
};

type Metrics = {
  sidebarMetrics: SidebarMetrics;
  growthAndValuationAnalysisMetrics: AnalysisMetrics;
  financialAndRiskAnalysisMetrics: AnalysisMetrics;
};

export const ReportInfo = ({
  reportId,
  userId,
}: {
  reportId: string;
  userId: string;
}) => {
  const [logoName, setLogoName] = useState<string | null>(null);
  const [chart, setChart] = useState<HTMLDivElement | null>(null);
  const [apiCacheData, setApiCacheData] = useState<apiCacheData | null>(null);

  const onRefChange = useCallback((node: HTMLDivElement) => {
    setChart(node);
  }, []);

  const supabase = createClient();
  const { data: report } = useQuery(fetchReportById(supabase, reportId));
  const { data: templateConfig } = useQuery(
    fetchTemplateConfig(supabase, reportId),
  );
  const { data: apiCache } = useQuery(
    fetchAPICacheByReportId(supabase, reportId),
  );

  useEffect(() => {
    if (!apiCache) return;

    const incomeStatement = apiCache.find((cache) =>
      cache.endpoint.includes('INCOME_STATEMENT'),
    );

    const earnings = apiCache.find((cache) =>
      cache.endpoint.includes('EARNINGS'),
    );

    const dailyStock = apiCache.find((cache) =>
      cache.endpoint.includes('TIME_SERIES_DAILY'),
    );

    if (incomeStatement && earnings && dailyStock) {
      setApiCacheData({
        incomeStatement: incomeStatement.json_data as IncomeStatement,
        earnings: earnings.json_data as Earnings,
        dailyStock: dailyStock.json_data as DailyStockData,
      });
    }
  }, [apiCache]);

  const { data: authorCompanyLogoUrl } = useFileUrl(
    supabase.storage.from('company-logos'),
    `${userId}/${templateConfig?.author_company_logo}`,
    'private',
    {
      ensureExistence: true,
      refetchOnWindowFocus: false,
      enabled: !!templateConfig && !!templateConfig.author_company_logo,
    },
  );

  const { data: images } = useDirectory(
    supabase.storage.from('public-company-logos'),
    report?.companies?.cik ?? '',
    { refetchOnWindowFocus: false, enabled: !!report && !!report.companies },
  );

  const { data: companyLogoUrl } = useFileUrl(
    supabase.storage.from('public-company-logos'),
    `${report?.companies?.cik}/${logoName}`,
    'private',
    {
      ensureExistence: true,
      refetchOnWindowFocus: false,
      enabled: !!report && !!logoName,
    },
  );

  useEffect(() => {
    if (!images) return;
    const logo =
      images.find((image) => image.name === 'dark-logo') ??
      images.find((image) => image.name === 'light-logo') ??
      images.find((image) => image.name === 'dark-icon') ??
      images.find((image) => image.name === 'light-icon') ??
      images.find((image) => image.name === 'dark-symbol') ??
      images.find((image) => image.name === 'light-symbol');

    setLogoName(logo?.name ?? null);
  }, [images]);

  const downloadDocx = async () => {
    if (
      !report ||
      !report.companies ||
      !templateConfig ||
      !templateConfig.metrics ||
      !chart
    ) {
      return;
    }

    if (
      !report.recommendation ||
      !report.financial_strength ||
      !report.targetprice
    ) {
      throw new Error(
        'Cannot create Equity Analyst Template without recommendation, financial strength, and target price.',
      );
    }

    if (!companyLogoUrl) {
      throw new Error('Could not find company logos.');
    }

    const authorCompanyLogo = await fetch(
      authorCompanyLogoUrl ?? defaultCompanyLogo,
    ).then((res) => res.blob());

    const companyLogo = await fetch(companyLogoUrl).then((res) => res.blob());

    const firstPageVisual = await toPng(chart)
      .then((url) => fetch(url))
      .then((res) => res.blob());

    const metrics = templateConfig.metrics as Metrics;

    const docxBlob = await getDocxBlob({
      componentId: templateConfig.template_type,
      summary: templateConfig.summary ?? [],
      businessDescription: templateConfig.business_description ?? '',
      authorName: templateConfig.author_name,
      authorCompanyName: templateConfig.author_company_name,
      colorScheme: templateConfig.color_scheme,
      content: report.json_content as JSONContent,
      companyName: report.companies.company_name,
      companyTicker: report.company_ticker,
      sidebarMetrics: metrics.sidebarMetrics,
      growthAndValuationAnalysisMetrics:
        metrics.growthAndValuationAnalysisMetrics,
      financialAndRiskAnalysisMetrics: metrics.financialAndRiskAnalysisMetrics,
      recommendation: report.recommendation as Recommendation,
      financialStrength: report.financial_strength as FinancialStrength,
      targetPrice: report.targetprice,
      authorCompanyLogo: authorCompanyLogo,
      companyLogo: companyLogo,
      firstPageVisual: firstPageVisual,
    });

    const url = URL.createObjectURL(docxBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = report.title;
    link.click();
    URL.revokeObjectURL(url);

    // const formData = new FormData();
    // formData.append('file', docxBlob);

    // const pdfBlob = await fetch('/api/convert/', {
    //   method: 'POST',
    //   body: formData,
    // }).then((res) => res.blob());
  };

  return (
    <div className="w-[360px] py-4">
      <div className="sr-only" id="hidden-container">
        {apiCache &&
          templateConfig &&
          report &&
          report.targetprice &&
          apiCacheData && (
            <MarketDataChart
              colors={templateConfig.color_scheme}
              targetPrice={report.targetprice}
              incomeStatement={apiCacheData.incomeStatement}
              earnings={apiCacheData.earnings}
              dailyStock={apiCacheData.dailyStock}
              ref={onRefChange}
            />
          )}
      </div>
      <div className="flex w-full justify-between">
        <Button variant="outline">Update</Button>
        <Button variant="outline">Audit</Button>
        <Button
          variant="outline"
          onClick={downloadDocx}
          disabled={!report || !templateConfig}
        >
          Download
        </Button>
      </div>
    </div>
  );
};
