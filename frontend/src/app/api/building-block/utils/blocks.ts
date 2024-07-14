import {
  DailyStockData,
  Overview,
  WeeklyStockData,
} from '@/types/alphaVantageApi';
import {
  Inputs,
  RecAndTargetPriceInputs,
  SummaryInputs,
  generateBlock,
} from './generateBlock';
import { SubscriptionPlan } from '@/types/subscription';
import {
  get10KItem,
  get10KSection,
} from '@/app/(protected)/reports/utils/parseXml';
import { MetricsData } from '@/types/metrics';

export type ApiProp = {
  overview: Overview;
  dailyStock: DailyStockData;
  weeklyStock: WeeklyStockData;
  yfAnnual: MetricsData;
  yfQuarterly: MetricsData;
};

export type Block =
  | 'company_overview'
  | 'investment_thesis'
  | 'business_description'
  | 'recent_developments'
  | 'management'
  | 'risks'
  | 'financial_analysis'
  | 'valuation'
  | 'targetprice_recommendation';

export type GeneralBlock = {
  plan: SubscriptionPlan;
  blockId: Block;
  companyName: string;
  apiData: ApiProp;
  xmlData: string;
  newsData: string;
  customPrompt: string;
  recommendation?: string;
  targetPrice?: string;
};

export type ExecSummary = {
  plan: SubscriptionPlan;
  blockId: 'executive_summary';
  generatedReport: string;
};

export type RecAndTargetPrice = {
  plan: SubscriptionPlan;
  blockId: 'targetprice_recommendation';
  companyName: string;
  apiData: ApiProp;
  recommendation?: string;
};

export type Params = ExecSummary | RecAndTargetPrice | GeneralBlock;

const getRecAndTargetPriceContext = (apiData: ApiProp) => {
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
  return newsData;
};

const getManagementContext = (
  apiData: ApiProp,
  xmlData: string,
  newsData: string,
): string => {
  const leadership = get10KSection(xmlData, 'leadership');
  const item = get10KItem(xmlData, '7', '8');

  const context = {
    'Leadership Sections': leadership,
    "Item 7. Management's Discussion and Analysis": item,
  };

  return JSON.stringify(context);
};

const getRisksContext = (
  apiData: ApiProp,
  xmlData: string,
  newsData: string,
): string => {
  const item = get10KItem(xmlData, '1a', '2');
  const context = { 'Item 1A. Risk Factors': item };

  return JSON.stringify(context);
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
  };

  return JSON.stringify(context);
};

const getValuationContext = (
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

export const getBlock = async (params: Params) => {
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
    const context = contextFn(params.apiData, params.xmlData, params.newsData);
    const inputs: Inputs = {
      CONTEXT: context,
      COMPANY_NAME: params.companyName,
      CUSTOM_PROMPT: '',
    };
    params.recommendation && (inputs['RECOMMENDATION'] = params.recommendation);
    params.targetPrice && (inputs['TARGET_PRICE'] = params.targetPrice);

    const res = await generateBlock(params.blockId, inputs, params.plan);
    return res;
  }
};
