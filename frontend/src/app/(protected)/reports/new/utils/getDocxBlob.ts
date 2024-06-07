import { TEMPLATES } from '@/lib/templates';
import { TemplateConfig, TemplateData } from '../Component';
import {
  getFinancialAndRiskAnalysisMetrics,
  getGrowthAndValuationAnalysisMetrics,
  getNWeeksStock,
  getSidebarMetrics,
} from '@/lib/utils/financialAPI';
import { OVERVIEW } from '@/lib/data/overview_ibm';
import { BALANCE_SHEET_IBM } from '@/lib/data/balance_sheet_ibm';
import { INCOME_STATEMENT_IBM } from '@/lib/data/income_statement_ibm';
import { DAILY_STOCK_IBM } from '@/lib/data/daily_stock_ibm';
import { CASHFLOW_IBM } from '@/lib/data/cashflow_ibm';
import { EARNINGS_IBM } from '@/lib/data/earnings_ibm';

export const getDocxBlob = async (
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
      sidebarMetrics: getSidebarMetrics(
        OVERVIEW,
        BALANCE_SHEET_IBM,
        INCOME_STATEMENT_IBM,
        getNWeeksStock(DAILY_STOCK_IBM),
        182,
        'HIGH',
      ),
      growthAndValuationAnalysisMetrics: getGrowthAndValuationAnalysisMetrics(
        BALANCE_SHEET_IBM,
        CASHFLOW_IBM,
        INCOME_STATEMENT_IBM,
        EARNINGS_IBM,
        DAILY_STOCK_IBM,
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
