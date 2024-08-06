import {
  DailyStockData,
  Overview,
  WeeklyStockData,
} from '@/types/alphaVantageApi';
import {
  get10KItem,
  get10KSection,
} from '@/app/(protected)/reports/utils/parseXml';
import { MetricsData } from '@/types/metrics';
import { Logger } from 'next-axiom';
import {
  getHighestStockPrice,
  getLowestStockPrice,
  getYearsStock,
} from '@/lib/utils/metrics/stock';
import { calculateRatio } from '@/lib/utils/metrics/financialUtils';
import { formatSafeNumber } from '@/lib/utils/metrics/safeCalculations';
import {
  BuildingBlockParams,
  generateBlock,
  Inputs,
  RecAndTargetPriceInputs,
  SummaryInputs,
} from './buildingBlocks';

export type ApiProp = {
  overview: Overview;
  dailyStock: DailyStockData;
  weeklyStock: WeeklyStockData;
  yfAnnual: MetricsData;
  yfQuarterly: MetricsData;
};

const calculatePE = (apiData: ApiProp) => {
  const curYear = new Date().getFullYear();
  const years =
    apiData.yfAnnual.incomeStatement.TotalRevenue.length > 5
      ? 5
      : apiData.yfAnnual.incomeStatement.TotalRevenue.length;

  const highestStock = [...Array(years).keys()]
    .map((_, i) =>
      Number(
        getHighestStockPrice(
          getYearsStock(apiData.dailyStock, curYear - i - 1),
        ),
      ),
    )
    .reverse();

  const lowestStock = [...Array(years).keys()]
    .map((_, i) =>
      Number(
        getLowestStockPrice(getYearsStock(apiData.dailyStock, curYear - i - 1)),
      ),
    )
    .reverse();

  const pe =
    apiData.yfAnnual.incomeStatement.BasicEPS?.slice(-5).map((y, i) => ({
      asOfDate: y.asOfDate,
      value: `${formatSafeNumber(
        calculateRatio(highestStock[i], y.value),
      )} - ${formatSafeNumber(calculateRatio(lowestStock[i], y.value))}`,
    })) ?? Array.from({ length: 5 }, () => '--');

  return pe;
};

export const getRecAndTargetPriceContext = (apiData: ApiProp) => {
  const context = {
    annualData: apiData.yfAnnual,
    quarterlyData: apiData.yfQuarterly,
    stock: apiData.weeklyStock['Weekly Adjusted Time Series'],
    forwardPE: apiData.overview.ForwardPE,
    trailingPE: apiData.overview.TrailingPE,
  };

  return JSON.stringify(context);
};

const getCompanyOverviewContext = (
  apiData: ApiProp,
  xmlData: string,
  newsData: string,
) => {
  const context = {
    description: apiData.overview.Description,
    incomeStatements: apiData.yfAnnual.incomeStatement,
  };

  return JSON.stringify(context);
};

const getInvestmentThesisContext = (
  apiData: ApiProp,
  xmlData: string,
  newsData: string,
): string => {
  const context = {
    incomeStatements: {
      annual: apiData.yfAnnual.incomeStatement,
      quarterly: apiData.yfQuarterly.incomeStatement,
    },
  };

  return JSON.stringify(context);
};

const getBusinessDescriptionContext = (
  apiData: ApiProp,
  xmlData: string,
  newsData: string,
): string => {
  const item = get10KItem(xmlData, '1', '1a');

  const context = {
    '10-K Item 1. Business': item,
    description: apiData.overview.Description,
    incomeStatements: {
      annual: apiData.yfAnnual.incomeStatement,
      quarterly: apiData.yfQuarterly.incomeStatement,
    },
  };

  return JSON.stringify(context);
};

const getRecentDevelopmentsContext = (
  apiData: ApiProp,
  xmlData: string,
  newsData: string,
): string => {
  const leadership = get10KSection(xmlData, 'leadership');

  return JSON.stringify({ newsData, leadership });
};

const getManagementContext = (
  apiData: ApiProp,
  xmlData: string,
  newsData: string,
): string => {
  const log = new Logger();
  try {
    const leadership = get10KSection(xmlData, 'leadership');
    const item = get10KItem(xmlData, '7', '8');

    const context = {
      'Leadership Sections': leadership,
      "Item 7. Management's Discussion and Analysis": item,
    };

    return JSON.stringify(context);
  } catch (err) {
    if (err instanceof Error) {
      log.error('Error when getting management context', err);
    }
    return JSON.stringify({
      'Leadership Sections': '',
      "Item 7. Management's Discussion and Analysis": '',
    });
  }
};

const getRisksContext = (
  apiData: ApiProp,
  xmlData: string,
  newsData: string,
): string => {
  const log = new Logger();

  try {
    const item = get10KItem(xmlData, '1a', '2');
    const context = { 'Item 1A. Risk Factors': item };

    console.log(context);
    return JSON.stringify(context);
  } catch (err) {
    if (err instanceof Error) {
      log.error('Error when getting risks context', err);
    }
    return JSON.stringify({ 'Item 1A. Risk Factors': '' });
  }
};

const getFinancialAnalysisContext = (
  apiData: ApiProp,
  xmlData: string,
  newsData: string,
): string => {
  const context = {
    incomeStatements: {
      annual: apiData.yfAnnual.incomeStatement,
      quarterly: apiData.yfQuarterly.incomeStatement,
    },
    balanceSheet: {
      annual: apiData.yfAnnual.balanceSheet,
      quarterly: apiData.yfQuarterly.balanceSheet,
    },
    cashflow: {
      annual: apiData.yfAnnual.cashFlow,
      quarterly: apiData.yfQuarterly.cashFlow,
    },
    'P/E: High-Lowf': calculatePE(apiData),
  };

  return JSON.stringify(context);
};

const getValuationContext = (
  apiData: ApiProp,
  xmlData: string,
  newsData: string,
): string => {
  const context = {
    overview: apiData.overview,
    incomeStatements: {
      annual: apiData.yfAnnual.incomeStatement,
      quarterly: apiData.yfQuarterly.incomeStatement,
    },
    'P/E: High-Low': calculatePE(apiData),
  };
  return JSON.stringify(context);
};

const contextMap = {
  company_overview: getCompanyOverviewContext,
  investment_thesis: getInvestmentThesisContext,
  business_description: getBusinessDescriptionContext,
  recent_developments: getRecentDevelopmentsContext,
  management: getManagementContext,
  risks: getRisksContext,
  financial_analysis: getFinancialAnalysisContext,
  valuation: getValuationContext,
};

export const getBlock = async (params: BuildingBlockParams) => {
  try {
    if (params.blockId === 'executive_summary') {
      const inputs: SummaryInputs = { REPORT: params.generatedReport };

      const res = await generateBlock(params.blockId, inputs, params.plan);
      return res;
    }
    if (params.blockId === 'targetprice_recommendation') {
      const inputs: RecAndTargetPriceInputs = {
        CONTEXT: getRecAndTargetPriceContext(params.apiData),
        RECOMMENDATION: params.recommendation,
      };

      const res = await generateBlock(params.blockId, inputs, params.plan);
      return res;
    } else {
      // @ts-ignore
      const contextFn = contextMap[params.blockId];
      const context = contextFn(
        params.apiData,
        params.xmlData,
        params.newsData,
      );
      const inputs: Inputs = {
        CONTEXT: context,
        COMPANY_NAME: params.companyName,
        CUSTOM_PROMPT: '',
      };
      params.recommendation &&
        (inputs['RECOMMENDATION'] = params.recommendation);
      params.targetPrice && (inputs['TARGET_PRICE'] = params.targetPrice);

      const res = await generateBlock(params.blockId, inputs, params.plan);
      return res;
    }
  } catch (err) {
    throw err;
  }
};
