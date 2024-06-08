import { Humanloop } from 'humanloop';

import {
  BalanceSheet,
  Cashflow,
  DailyStockData,
  Earnings,
  IncomeStatement,
  Overview,
} from '@/types/alphaVantageApi';

if (!process.env.HUMANLOOP_API_KEY) {
  throw new Error('Humanloop api key is required.');
}

const humanloop = new Humanloop({
  apiKey: process.env.HUMANLOOP_API_KEY,
});

export type ApiProp = {
  overview: Overview;
  balanceSheet: BalanceSheet;
  cashflow: Cashflow;
  incomeStatement: IncomeStatement;
  dailyStock: DailyStockData;
  earnings: Earnings;
};

const companyOverviewContext = (apiData: ApiProp): string => {
  let context = {
    description: apiData.overview.Description,
    incomeStatements: [
      apiData.incomeStatement.annualReports[0],
      apiData.incomeStatement.annualReports[1],
    ],
  };

  return JSON.stringify(context);
};

const investmentThesisContext = (apiData: ApiProp): string => {
  let context = {
    incomeStatements: {
      annual: [
        apiData.incomeStatement.annualReports[0],
        apiData.incomeStatement.annualReports[1],
      ],
      quarterly: [
        apiData.incomeStatement.quarterlyReports[0],
        apiData.incomeStatement.quarterlyReports[1],
      ],
    },
  };

  return JSON.stringify(context);
};

const businessDescriptionContext = (apiData: ApiProp): string => {
  let context = {
    incomeStatements: {
      annual: [
        apiData.incomeStatement.annualReports[0],
        apiData.incomeStatement.annualReports[1],
      ],
      quarterly: [
        apiData.incomeStatement.quarterlyReports[0],
        apiData.incomeStatement.quarterlyReports[1],
      ],
    },
  };

  return JSON.stringify(context);
};

const recentDevelopmentsContext = (apiData: ApiProp): string => {
  return '';
};

const industryOverviewCompetitivePositioningContext = (
  apiData: ApiProp,
): string => {
  return '';
};

const financialAnalysisContext = (apiData: ApiProp): string => {
  let context = {
    incomeStatements: {
      annual: [
        apiData.incomeStatement.annualReports[0],
        apiData.incomeStatement.annualReports[1],
        apiData.incomeStatement.annualReports[2],
        apiData.incomeStatement.annualReports[3],
        apiData.incomeStatement.annualReports[4],
      ],
      quarterly: [
        apiData.incomeStatement.quarterlyReports[0],
        apiData.incomeStatement.quarterlyReports[1],
        apiData.incomeStatement.quarterlyReports[2],
        apiData.incomeStatement.quarterlyReports[3],
        apiData.incomeStatement.quarterlyReports[4],
      ],
    },
    balanceSheet: {
      annual: [
        apiData.balanceSheet.annualReports[0],
        apiData.balanceSheet.annualReports[1],
        apiData.balanceSheet.annualReports[2],
        apiData.balanceSheet.annualReports[3],
        apiData.balanceSheet.annualReports[4],
      ],
      quarterly: [
        apiData.balanceSheet.quarterlyReports[0],
        apiData.balanceSheet.quarterlyReports[1],
        apiData.balanceSheet.quarterlyReports[2],
        apiData.balanceSheet.quarterlyReports[3],
        apiData.balanceSheet.quarterlyReports[4],
      ],
    },
    cashflow: {
      annual: [
        apiData.cashflow.annualReports[0],
        apiData.cashflow.annualReports[1],
        apiData.cashflow.annualReports[2],
        apiData.cashflow.annualReports[3],
        apiData.cashflow.annualReports[4],
      ],
      quarterly: [
        apiData.cashflow.quarterlyReports[0],
        apiData.cashflow.quarterlyReports[1],
        apiData.cashflow.quarterlyReports[2],
        apiData.cashflow.quarterlyReports[3],
        apiData.cashflow.quarterlyReports[4],
      ],
    },
  };

  return JSON.stringify(context);
};

const valuationContext = (apiData: ApiProp): string => {
  let context = {
    incomeStatements: {
      annual: [
        apiData.incomeStatement.annualReports[0],
        apiData.incomeStatement.annualReports[1],
      ],
      quarterly: [
        apiData.incomeStatement.quarterlyReports[0],
        apiData.incomeStatement.quarterlyReports[1],
      ],
    },
  };

  return JSON.stringify(context);
};

const managementAndRisksContext = (apiData: ApiProp): string => {
  return '';
};

const environmentAndSustainabilityContext = (apiData: ApiProp): string => {
  return '';
};

const contextMap: Record<string, (apiData: ApiProp) => string> = {
  company_overview: (apiData) => companyOverviewContext(apiData),
  investment_thesis: investmentThesisContext,
  business_description: businessDescriptionContext,
  recent_developments: recentDevelopmentsContext,
  industry_overview_competitive_positioning:
    industryOverviewCompetitivePositioningContext,
  financial_analysis: financialAnalysisContext,
  valuation: valuationContext,
  management_and_risks: managementAndRisksContext,
  environment_and_sustainability_governance:
    environmentAndSustainabilityContext,
};

const humanloopIdsMap: Record<string, string> = {
  company_overview: 'pr_eEsRLn1ueHYu2ohtbLfz8',
  investment_thesis: 'pr_InocnkalxtNTfsiEuFycf',
  business_description: 'pr_9GNKdyMlqcxSm2VAhXd1Q',
  recent_developments: 'pr_IkkvqHAnRftNW74gjqI3s',
  industry_overview_competitive_positioning: 'pr_ky4Ib9RjHwHhncWkVkZok',
  financial_analysis: 'pr_zkb65gD2Q42TTxTdFTVEa',
  valuation: 'pr_M4oPT2h4FumPzvwz78ABa',
  management_and_risks: 'pr_TkzimL1MD7xJUMA0wp7yz',
  environment_and_sustainability_governance: 'pr_Hp3kSGo0vlOaS5Yo6pkor',
};

export const generateBlock = async (
  blockId: string,
  customPrompt: string,
  companyName: string,
  apiData: ApiProp,
) => {
  const context = contextMap[blockId](apiData);
  // const config = await humanloop.projects
  //   .getActiveConfig({
  //     id: humanloopIdsMap[blockId],
  //   })
  //   .then((res) => res.data.config);

  const chatResponse = await humanloop
    .chatDeployed({
      project_id: humanloopIdsMap[blockId],
      // @ts-ignore
      messages: [],
      source: 'dev-frontend',
      inputs: {
        CONTEXT: context,
        CUSTOM_PROMPT: customPrompt,
        COMPANY_NAME: companyName,
      },
      // model_config: {
      //   name: 'haiku',
      //   provider: 'anthropic',
      //   model: 'claude-3-haiku-20240307',
      //   temperature: 0.2,
      // },
    })
    .then((res) => res.data.data);

  return chatResponse[0].output;
};
