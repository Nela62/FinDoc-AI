import { TEMPLATES } from '@/lib/templates';
import { TemplateConfig, TemplateData } from '../Component';
import {
  TopBarMetric,
  getFinancialAndRiskAnalysisMetrics,
  getGrowthAndValuationAnalysisMetrics,
  getNWeeksStock,
  getSidebarMetrics,
  getTopBarMetrics,
} from '@/lib/utils/financialAPI';
import { OVERVIEW } from '@/lib/data/overview_ibm';
import { BALANCE_SHEET_IBM } from '@/lib/data/balance_sheet_ibm';
import { INCOME_STATEMENT_IBM } from '@/lib/data/income_statement_ibm';
import { CASHFLOW_IBM } from '@/lib/data/cashflow_ibm';
import { EARNINGS_IBM } from '@/lib/data/earnings_ibm';
import { JSONContent } from '@tiptap/core';
import { SidebarMetrics } from '@/lib/templates/metrics/components/statistics';
import { AnalysisMetrics } from '@/lib/templates/docxTables/financialAnalysisTable';
import { FinancialStrength, Recommendation } from '@/types/report';
import { Overview } from '@/types/alphaVantageApi';
import { DAILY_IBM } from '@/lib/data/daily_imb';

export const getTemplateDocxBlob = async (
  templateData: TemplateData,
  templateConfig: TemplateConfig,
  authorCompanyLogo: Blob,
  companyLogo: Blob,
  firstPageVisual: Blob,
) => {
  if (!TEMPLATES.hasOwnProperty(templateData.componentId)) {
    throw new Error("Template with this component id doesn't exist");
  }

  // ({ content, colors, twoColumn, authors, authorCompanyName, authorCompanyLogo, createdAt, companyName, companyTicker, companyLogo, summary, businessDescription, sidebarMetrics, growthAndValuationAnalysisMetrics, financialAndRiskAnalysisMetrics, ratings, recommendation, financialStrength, targetPrice, firstPageVisual, secondPageVisual, lastPageVisual, }: EquityAnalystSidebarProps & TemplateConfig)
  const templateFn = TEMPLATES[templateData.componentId];

  try {
    console.log('docxBlob');
    const docxBlob = await templateFn({
      content: templateData.sampleText,
      colors: templateConfig.colorScheme.colors,
      twoColumn: true,
      authors: [templateConfig.authorName],
      authorCompanyName: templateConfig.authorCompanyName,
      authorCompanyLogo: authorCompanyLogo,
      createdAt: new Date(),
      companyName: 'Acme Industries, Inc.',
      companyTicker: 'ACME',
      companyLogo: companyLogo,
      summary: templateData.summary ?? [],
      businessDescription: templateData.businessDescription ?? '',
      topBarMetrics: getTopBarMetrics(OVERVIEW, 182, getNWeeksStock(DAILY_IBM)),
      sidebarMetrics: getSidebarMetrics(
        OVERVIEW,
        BALANCE_SHEET_IBM,
        INCOME_STATEMENT_IBM,
        getNWeeksStock(DAILY_IBM),
        182,
        'HIGH',
      ),
      growthAndValuationAnalysisMetrics: getGrowthAndValuationAnalysisMetrics(
        BALANCE_SHEET_IBM,
        CASHFLOW_IBM,
        INCOME_STATEMENT_IBM,
        EARNINGS_IBM,
        DAILY_IBM,
      ),
      financialAndRiskAnalysisMetrics: getFinancialAndRiskAnalysisMetrics(
        BALANCE_SHEET_IBM,
        CASHFLOW_IBM,
        INCOME_STATEMENT_IBM,
      ),
      ratings: [
        {
          name: '12-month',
          list: ['SELL', 'UW', 'HOLD', 'OW', 'BUY'],
          current: 'BUY',
        },
        {
          name: 'Financial Strength',
          list: ['LOW', 'LM', 'MED', 'MH', 'HIGH'],
          current: 'HIGH',
        },
      ],
      recommendation: 'Buy',
      financialStrength: 'High',
      targetPrice: 182,
      firstPageVisual: firstPageVisual,
      sources: [],
    });

    return docxBlob;
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
  throw new Error('geting docx blob failed');
};

const convertRecommendation = (recommendation: Recommendation) => {
  switch (recommendation) {
    case 'Buy':
      return 'BUY';
    case 'Hold':
      return 'HOLD';
    case 'Overweight':
      return 'OW';
    case 'Underweight':
      return 'UW';
    case 'Sell':
      return 'SELL';
    default:
      return recommendation;
  }
};

const convertFinancialStrength = (financialStrength: FinancialStrength) => {
  switch (financialStrength) {
    case 'Low':
      return 'LOW';
    case 'Low-Medium':
      return 'LM';
    case 'Medium':
      return 'MED';
    case 'Medium-High':
      return 'MH';
    case 'High':
      return 'HIGH';
    default:
      return financialStrength;
  }
};

export const getDocxBlob = async ({
  componentId,
  summary,
  businessDescription,
  authorName,
  authorCompanyName,
  authorCompanyLogo,
  colorScheme,
  companyLogo,
  firstPageVisual,
  content,
  companyName,
  companyTicker,
  topBarMetrics,
  sidebarMetrics,
  growthAndValuationAnalysisMetrics,
  financialAndRiskAnalysisMetrics,
  recommendation,
  financialStrength,
  targetPrice,
  sources,
}: {
  componentId: string;
  summary: string[];
  businessDescription: string;
  authorName: string;
  authorCompanyName: string;
  authorCompanyLogo: Blob;
  colorScheme: string[];
  companyLogo: Blob;
  firstPageVisual: Blob;
  content: JSONContent;
  companyName: string;
  companyTicker: string;
  topBarMetrics: TopBarMetric[];
  sidebarMetrics: SidebarMetrics;
  growthAndValuationAnalysisMetrics: AnalysisMetrics;
  financialAndRiskAnalysisMetrics: AnalysisMetrics;
  recommendation: Recommendation;
  financialStrength: FinancialStrength;
  targetPrice: number;
  sources: string[];
}) => {
  if (!TEMPLATES.hasOwnProperty(componentId)) {
    throw new Error("Template with this component id doesn't exist");
  }

  // ({ content, colors, twoColumn, authors, authorCompanyName, authorCompanyLogo, createdAt, companyName, companyTicker, companyLogo, summary, businessDescription, sidebarMetrics, growthAndValuationAnalysisMetrics, financialAndRiskAnalysisMetrics, ratings, recommendation, financialStrength, targetPrice, firstPageVisual, secondPageVisual, lastPageVisual, }: EquityAnalystSidebarProps & TemplateConfig)
  const templateFn = TEMPLATES[componentId];

  try {
    console.log('docxBlob');
    const docxBlob = await templateFn({
      content: content,
      colors: colorScheme,
      twoColumn: true,
      authors: [authorName],
      authorCompanyName: authorCompanyName,
      authorCompanyLogo: authorCompanyLogo,
      createdAt: new Date(),
      companyName: companyName,
      companyTicker: companyTicker,
      companyLogo: companyLogo,
      summary: summary ?? [],
      businessDescription: businessDescription ?? '',
      topBarMetrics: topBarMetrics,
      sidebarMetrics: sidebarMetrics,
      growthAndValuationAnalysisMetrics: growthAndValuationAnalysisMetrics,
      financialAndRiskAnalysisMetrics: financialAndRiskAnalysisMetrics,
      ratings: [
        {
          name: '12-month',
          list: ['SELL', 'UW', 'HOLD', 'OW', 'BUY'],
          current: convertRecommendation(recommendation),
        },
        {
          name: 'Financial Strength',
          list: ['LOW', 'LM', 'MED', 'MH', 'HIGH'],
          current: convertFinancialStrength(financialStrength),
        },
      ],
      recommendation: recommendation,
      financialStrength: financialStrength,
      targetPrice: targetPrice,
      firstPageVisual: firstPageVisual,
      sources: sources,
    });

    return docxBlob;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      throw new Error(error.message);
    }
  }
  throw new Error('geting docx blob failed');
};
