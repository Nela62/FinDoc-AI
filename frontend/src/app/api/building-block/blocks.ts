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

const contextMap: Record<string, (apiData: ApiProp) => string> = {
  company_overview: (apiData) => companyOverviewContext(apiData),
};

const humanloopIdsMap: Record<string, string> = {
  company_overview: 'pr_eEsRLn1ueHYu2ohtbLfz8',
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
