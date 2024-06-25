import {
  BalanceSheet,
  Cashflow,
  DailyStockData,
  Earnings,
  IncomeStatement,
  Overview,
} from '@/types/alphaVantageApi';
import { Inputs, generateBlock } from './generateBlock';
import { SubscriptionPlan } from '@/types/subscription';
import {
  get10KItem,
  get10KSection,
} from '@/app/(protected)/reports/utils/parseXml';

export type ApiProp = {
  overview: Overview;
  balanceSheet: BalanceSheet;
  cashflow: Cashflow;
  incomeStatement: IncomeStatement;
  dailyStock: DailyStockData;
  earnings: Earnings;
};

export type Params = {
  plan: SubscriptionPlan;
  blockId: string;
  companyName: string;
  apiData: ApiProp;
  xmlData: string;
  newsData: string;
  customPrompt: string;
  recommendation?: string;
  targetPrice?: string;
};

const getCompanyOverviewContext = (
  apiData: ApiProp,
  xmlData: string,
  newsData: string,
) => {
  const context = {
    description: apiData.overview.Description,
    incomeStatements: [
      apiData.incomeStatement.annualReports[0],
      apiData.incomeStatement.annualReports[1],
    ],
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
      annual: apiData.incomeStatement.annualReports.slice(0, 2),
      quarterly: apiData.incomeStatement.quarterlyReports.slice(0, 2),
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
      annual: apiData.incomeStatement.annualReports.slice(0, 2),
      quarterly: apiData.incomeStatement.quarterlyReports.slice(0, 2),
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
      annual: apiData.incomeStatement.annualReports.slice(0, 5),
      quarterly: apiData.incomeStatement.quarterlyReports.slice(0, 5),
    },
    balanceSheet: {
      annual: apiData.balanceSheet.annualReports.slice(0, 5),
      quarterly: apiData.balanceSheet.quarterlyReports.slice(0, 5),
    },
    cashflow: {
      annual: apiData.cashflow.annualReports.slice(0, 5),
      quarterly: apiData.cashflow.quarterlyReports.slice(0, 5),
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
      annual: apiData.incomeStatement.annualReports.slice(0, 2),
      quarterly: apiData.incomeStatement.quarterlyReports.slice(0, 2),
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

  const text = await generateBlock(params.blockId, inputs, params.plan);
  return text;
};
