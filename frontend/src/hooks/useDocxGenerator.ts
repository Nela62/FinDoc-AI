import { getDocxBlob } from '@/app/(protected)/reports/utils/getDocxBlob';
import { fetchReportById, fetchTemplateConfig } from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import { AnalysisMetrics } from '@/lib/templates/docxTables/financialAnalysisTable';
import { Metric, SidebarMetrics } from '@/lib/utils/financialAPI';
import { FinancialStrength, Recommendation } from '@/types/report';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import {
  useDirectory,
  useFileUrl,
  useRemoveFiles,
  useUpload,
} from '@supabase-cache-helpers/storage-react-query';
import { JSONContent } from '@tiptap/core';
import { useCallback, useEffect, useState } from 'react';

type Metrics = {
  topBarMetrics: Metric[];
  sidebarMetrics: SidebarMetrics;
  growthAndValuationAnalysisMetrics: AnalysisMetrics;
  financialAndRiskAnalysisMetrics: AnalysisMetrics;
  sources: string[];
};

const defaultCompanyLogo = '/default_finpanel_logo.png';

export const useDocxGenerator = (userId: string, reportId: string | null) => {
  const [logoName, setLogoName] = useState<string | null>(null);
  const [docxFile, setDocxFile] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  const supabase = createClient();
  const { data: report } = useQuery(fetchReportById(supabase, reportId ?? ''), {
    enabled: !!reportId,
  });
  const { data: templateConfig } = useQuery(
    fetchTemplateConfig(supabase, reportId ?? ''),
    { enabled: !!reportId },
  );

  const { data: docxFileData } = useFileUrl(
    supabase.storage.from('saved-templates'),
    `${userId}/${templateConfig?.id}/docx`,
    'private',
    {
      refetchOnWindowFocus: false,
      enabled: !!templateConfig,
      retry: false,
    },
  );

  const { mutateAsync: removeDocx } = useRemoveFiles(
    supabase.storage.from('saved-templates'),
  );

  const { data: pdfFileData } = useFileUrl(
    supabase.storage.from('saved-templates'),
    `${userId}/${templateConfig?.id}/pdf`,
    'private',
    {
      refetchOnWindowFocus: false,
      enabled: !!templateConfig,
      retry: false,
    },
  );

  const { mutateAsync: removePdf } = useRemoveFiles(
    supabase.storage.from('saved-templates'),
  );

  useEffect(() => {
    if (docxFileData) {
      setDocxFile(docxFileData);
    }
    if (pdfFileData) {
      setPdfFile(pdfFileData);
    }
  }, [docxFileData, pdfFileData]);

  // // TODO: remove apiCache from here and move overview and closing price to fin api utils
  // const { data: apiCache } = useQuery(
  //   getApiCacheByReportId(supabase, reportId ?? ''),
  //   { enabled: !!reportId },
  // );

  const { mutateAsync: uploadDocx } = useUpload(
    supabase.storage.from('saved-templates'),
    {
      buildFileName: () => `${userId}/${templateConfig?.id}/docx`,
      upsert: true,
    },
  );

  const { mutateAsync: uploadPdf } = useUpload(
    supabase.storage.from('saved-templates'),
    {
      buildFileName: () => `${userId}/${templateConfig?.id}/pdf`,
      upsert: true,
    },
  );

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

    console.log('set logo ', logo);

    setLogoName(logo?.name ?? null);
  }, [images]);

  useEffect(() => {
    if (logoName && companyLogoUrl) setLoading(false);
  }, [logoName, companyLogoUrl]);

  const generateDocxBlob = useCallback(
    async (images: Blob[]): Promise<Blob> => {
      if (!report || !report.companies) {
        throw new Error('Report is missing');
      }

      if (!templateConfig || !templateConfig.metrics) {
        throw new Error('TemplateConfig is missing');
      }

      if (!logoName) {
        throw new Error('LogoName is missing');
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
        console.log(logoName);
        throw new Error('Could not find company logos.');
      }

      const authorCompanyLogo = await fetch(
        authorCompanyLogoUrl ?? defaultCompanyLogo,
      ).then((res) => res.blob());

      const companyLogo = await fetch(companyLogoUrl).then((res) => res.blob());

      const metrics = templateConfig.metrics as Metrics;

      const docxBlob = await getDocxBlob({
        componentId: templateConfig.template_type,
        summary: templateConfig.summary ?? [],
        businessDescription: templateConfig.business_description ?? '',
        authorName: templateConfig.author_name,
        authorCompanyName: templateConfig.author_company_name,
        colorScheme: templateConfig.color_scheme,
        content: report.tiptap_content as JSONContent,
        companyName: report.companies.company_name,
        companyTicker: report.company_ticker,
        topBarMetrics: metrics.topBarMetrics,
        sidebarMetrics: metrics.sidebarMetrics,
        growthAndValuationAnalysisMetrics:
          metrics.growthAndValuationAnalysisMetrics,
        financialAndRiskAnalysisMetrics:
          metrics.financialAndRiskAnalysisMetrics,
        recommendation: report.recommendation as Recommendation,
        financialStrength: report.financial_strength as FinancialStrength,
        targetPrice: report.targetprice,
        authorCompanyLogo: authorCompanyLogo,
        companyLogo: companyLogo,
        topFirstPageVisual: images[0],
        bottomFirstPageVisual: images[1],
        sources: metrics.sources,
        exchange: report.companies.exchange ?? '',
      });

      if (!docxBlob) {
        throw new Error('docxBlob is undefined');
      }

      const docxFile = new File([docxBlob], 'docxBlob', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      uploadDocx({ files: [docxFile] });

      return docxBlob;
    },
    [
      authorCompanyLogoUrl,
      companyLogoUrl,
      report,
      templateConfig,
      uploadDocx,
      logoName,
    ],
  );

  const generatePdf = useCallback(
    async (docxBlob: Blob) => {
      const formData = new FormData();
      formData.append('file', docxBlob);

      const pdfBlob = await fetch('/api/convert/', {
        method: 'POST',
        body: formData,
      }).then((res) => res.blob());

      const pdfFile = new File([pdfBlob], 'pdfBlob', {
        type: 'application/pdf',
      });

      uploadPdf({ files: [pdfFile] });
    },
    [uploadPdf],
  );

  return {
    docxFile,
    pdfFile,
    isLoading,
    logoName,
    generateDocxBlob,
    generatePdf,
    targetPrice: report?.targetprice,
  };
};
