import { Humanloop } from 'humanloop';
import Anthropic from '@anthropic-ai/sdk';

import {
  BalanceSheet,
  Cashflow,
  DailyStockData,
  Earnings,
  IncomeStatement,
  NewsData,
  Overview,
} from '@/types/alphaVantageApi';

if (!process.env.HUMANLOOP_API_KEY) {
  throw new Error('Humanloop api key is required.');
}

const humanloop = new Humanloop({
  apiKey: process.env.HUMANLOOP_API_KEY,
});

const formatInstructions = `\nAfter you've outlined your key points in the scratchpad, write out your response inside <output> tags.`;

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
  investment_thesis: (apiData) => investmentThesisContext(apiData),
  business_description: (apiData) => businessDescriptionContext(apiData),
  recent_developments: (apiData) => recentDevelopmentsContext(apiData),
  industry_overview_competitive_positioning: (apiData) =>
    industryOverviewCompetitivePositioningContext(apiData),
  financial_analysis: (apiData) => financialAnalysisContext(apiData),
  valuation: (apiData) => valuationContext(apiData),
  management_and_risks: (apiData) => managementAndRisksContext(apiData),
  environment_and_sustainability_governance: (apiData) =>
    environmentAndSustainabilityContext(apiData),
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

const anthropic = new Anthropic();

function findReplaceString(string: string, find: string, replace: string) {
  if (/[a-zA-Z\_]+/g.test(string)) {
    return string.replace(
      new RegExp('{{(?:\\s+)?(' + find + ')(?:\\s+)?}}'),
      replace,
    );
  } else {
    throw new Error(
      'Find statement does not match regular expression: /[a-zA-Z_]+/',
    );
  }
}

export const generateBlock = async (
  blockId: string,
  customPrompt: string,
  companyName: string,
  apiData: ApiProp,
) => {
  const context = contextMap[blockId](apiData);
  const config = await humanloop.projects
    .getActiveConfig({
      id: humanloopIdsMap[blockId],
    })
    .then((res) => res.data.config);

  // @ts-ignore
  let template = config.chat_template[0].content;
  template = findReplaceString(template, 'CONTEXT', context);
  template = findReplaceString(template, 'CUSTOM_PROMPT', customPrompt);
  template = findReplaceString(template, 'COMPANY_NAME', companyName);

  const message = await anthropic.messages.create({
    temperature: 0.2,
    max_tokens: 4096,
    messages: [{ role: 'user', content: template + formatInstructions }],
    // model: 'claude-3-opus-20240229',
    model: 'claude-3-haiku-20240307',
  });

  // https://github.com/anthropics/anthropic-sdk-typescript/issues/432
  humanloop.log({
    project_id: humanloopIdsMap[blockId],
    config_id: config.id,
    inputs: {
      CONTEXT: context,
      CUSTOM_PROMPT: customPrompt,
      COMPANY_NAME: companyName,
    },
    output: message.content[0].text
      .replace(/(.*?)<output>/gs, '')
      .replace('</output>', ''),
  });

  // return message.content.find((block) => !block.text.includes('scratchpad'))
  //   .text;

  // @ts-ignore
  return message.content[0].text
    .replace(/(.*?)<output>/gs, '')
    .replace('</output>', '');
};

type NewsDataRes = {
  last3Months: NewsData;
  last6Months: NewsData;
  last12Months: NewsData;
};

// TODO: get content for each article
const getRecentDevelopmentsContext = async (news: NewsDataRes) => {
  let context: Record<string, string>[] = [];
  const promises = Object.keys(news).map((key: string) => {
    return Promise.all(
      news[key as keyof typeof news].feed.slice(0, 15).map(async (f) => {
        const content = await fetchNewsContent(f.url);
        const obj = {
          title: f.title,
          summary: f.summary,
          time_published: f.time_published,
          content: content ?? '',
        };
        context.push(obj);
      }),
    );
  });

  await Promise.all(promises);

  return JSON.stringify(context);
};

export const generateRecentDevelopments = async (
  blockId: string,
  customPrompt: string,
  companyName: string,
  news: NewsDataRes,
) => {
  const context = await getRecentDevelopmentsContext(news);
  const config = await humanloop.projects
    .getActiveConfig({
      id: humanloopIdsMap[blockId],
    })
    .then((res) => res.data.config);

  // @ts-ignore
  let template = config.chat_template[0].content;
  template = findReplaceString(template, 'CONTEXT', context);
  template = findReplaceString(template, 'CUSTOM_PROMPT', customPrompt);
  template = findReplaceString(template, 'COMPANY_NAME', companyName);

  const message = await anthropic.messages.create({
    temperature: 0.2,
    max_tokens: 4096,
    messages: [{ role: 'user', content: template + formatInstructions }],
    // model: 'claude-3-opus-20240229',
    model: 'claude-3-haiku-20240307',
  });

  humanloop.log({
    project_id: humanloopIdsMap[blockId],
    config_id: config.id,
    inputs: {
      CONTEXT: context,
      CUSTOM_PROMPT: customPrompt,
      COMPANY_NAME: companyName,
    },
    output: message.content[0].text
      .replace(/(.*?)<output>/gs, '')
      .replace('</output>', ''),
  });

  // return message.content.find((block) => !block.text.includes('scratchpad'))
  //   .text;
  // @ts-ignore
  return message.content[0].text
    .replace(/(.*?)<output>/gs, '')
    .replace('</output>', '');
};

export const generateInvestmentThesis = async (
  blockId: string,
  customPrompt: string,
  companyName: string,
  apiData: ApiProp,
  recommendation: string,
  targetPrice: string,
) => {
  const context = contextMap[blockId](apiData);
  const config = await humanloop.projects
    .getActiveConfig({
      id: humanloopIdsMap[blockId],
    })
    .then((res) => res.data.config);

  // @ts-ignore
  let template = config.chat_template[0].content;
  template = findReplaceString(template, 'CONTEXT', context);
  template = findReplaceString(template, 'CUSTOM_PROMPT', customPrompt);
  template = findReplaceString(template, 'COMPANY_NAME', companyName);
  template = findReplaceString(template, 'RECOMMENDATION', recommendation);
  template = findReplaceString(template, 'TARGET_PRICE', targetPrice);

  const message = await anthropic.messages.create({
    temperature: 0.2,
    max_tokens: 4096,
    messages: [{ role: 'user', content: template + formatInstructions }],
    // model: 'claude-3-opus-20240229',
    model: 'claude-3-haiku-20240307',
  });

  humanloop.log({
    project_id: humanloopIdsMap[blockId],
    config_id: config.id,
    inputs: {
      CONTEXT: context,
      CUSTOM_PROMPT: customPrompt,
      COMPANY_NAME: companyName,
      RECOMMENDATION: recommendation,
      TARGET_PRICE: targetPrice,
    },
    output: message.content[0].text
      .replace(/(.*?)<output>/gs, '')
      .replace('</output>', ''),
  });

  // return message.content.find((block) => !block.text.includes('scratchpad'))
  //   .text;
  // @ts-ignore
  return message.content[0].text
    .replace(/(.*?)<output>/gs, '')
    .replace('</output>', '');
};

export const generateSummary = async (reportContent: string) => {
  const config = await humanloop.projects
    .getActiveConfig({
      id: 'pr_U4jwcfdNjstPSeWE56IFS',
    })
    .then((res) => res.data.config);

  // @ts-ignore
  let template = config.chat_template[0].content;
  template = findReplaceString(template, 'REPORT', reportContent);

  const message = await anthropic.messages.create({
    temperature: 0.2,
    max_tokens: 4096,
    messages: [{ role: 'user', content: template + formatInstructions }],
    // model: 'claude-3-opus-20240229',
    model: 'claude-3-haiku-20240307',
  });

  // @ts-ignore
  return message.content[0].text
    .replace(/(.*?)<output>/gs, '')
    .replace('</output>', '');

  // humanloop.log({
  //   project_id: 'pr_U4jwcfdNjstPSeWE56IFS',
  //   config_id: config.id,
  //   inputs: {
  //     REPORT: reportContent,
  //   },
  //   output: message.content.find((block) => !block.text.includes('scratchpad'))
  //     .text,
  // });

  // return message.content.find((block) => !block.text.includes('scratchpad'))
  //   .text;
};

async function fetchNewsContent(url: string) {
  const jsdom = require('jsdom');
  const { JSDOM } = jsdom;

  const content = await fetch(url)
    .then((response) => response.text())
    .then((html) => {
      const dom = new JSDOM(html);
      const paragraphs = dom.window.document.querySelectorAll('p');
      const articleContent = Array.from(paragraphs).map((p) => p.textContent);

      return articleContent.join();
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  return content;
}

export const generate10KBlock = async (
  blockId: string,
  customPrompt: string,
  companyName: string,
  pdfData: Record<string, any>,
) => {
  let context = '';
  if (blockId === 'industry_overview_competitive_positioning') {
    context = getCompetition(pdfData);
  } else if (blockId === 'management_and_risks') {
    context = getManagementRisk(pdfData);
  }
  const config = await humanloop.projects
    .getActiveConfig({
      id: humanloopIdsMap[blockId],
    })
    .then((res) => res.data.config);

  // @ts-ignore
  let template = config.chat_template[0].content;
  template = findReplaceString(template, 'CONTEXT', context);
  template = findReplaceString(template, 'CUSTOM_PROMPT', customPrompt);
  template = findReplaceString(template, 'COMPANY_NAME', companyName);

  const message = await anthropic.messages.create({
    temperature: 0.2,
    max_tokens: 4096,
    messages: [{ role: 'user', content: template + formatInstructions }],
    // model: 'claude-3-opus-20240229',
    model: 'claude-3-haiku-20240307',
  });

  // https://github.com/anthropics/anthropic-sdk-typescript/issues/432
  humanloop.log({
    project_id: humanloopIdsMap[blockId],
    config_id: config.id,
    inputs: {
      CONTEXT: context,
      CUSTOM_PROMPT: customPrompt,
      COMPANY_NAME: companyName,
    },
    output: message.content[0].text
      .replace(/(.*?)<output>/gs, '')
      .replace('</output>', ''),
  });

  // return message.content.find((block) => !block.text.includes('scratchpad'))
  //   .text;

  // @ts-ignore
  return message.content[0].text
    .replace(/(.*?)<output>/gs, '')
    .replace('</output>', '');
};

// COMPETITION
function getCompetition(pdfData: Record<string, any>) {
  const start = pdfData.elements.findIndex(
    (element: any) =>
      element.Text?.trim() === 'Competition' && element.Font.weight === 700,
  );
  const end = pdfData.elements.findIndex(
    (element: any, i: number) => i > start && element.Font.weight === 700,
  );
  return pdfData.elements
    .slice(start, end)
    .map((el: any) => el.Text)
    .join('');
}

function getManagementRisk(pdfData: Record<string, any>) {
  console.log(pdfData.elements[0].Text);
  const start = pdfData.elements.findIndex(
    (element: any) =>
      typeof element.Text === 'string' &&
      element.Text.includes('Management\u2019s Discussion and Analysis') &&
      element.Font.weight === 700,
  );
  const regex = /Item\s+(\d+)\./i;

  let itemNumber = '';
  const match = pdfData.elements[start].Text.match(regex);
  if (match) {
    itemNumber = match[1];
    console.log(itemNumber);
  } else {
    console.log('No match found.');
  }

  const end = pdfData.elements.findIndex(
    (element: any, i: number) =>
      i > start &&
      typeof element.Text === 'string' &&
      element.Text.startsWith(`Item ${Number(itemNumber) + 1}`) &&
      element.Font.weight === 700,
  );
  return pdfData.elements
    .slice(start, end)
    .map((el: any) => el.Text)
    .join('');
}
