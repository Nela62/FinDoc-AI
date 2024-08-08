'use server';

import { SubscriptionPlan } from '@/types/subscription';
import { Logger } from 'next-axiom';
import { ApiData } from './apiData';

const log = new Logger();

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
  apiData: ApiData;
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
  apiData: ApiData;
  recommendation?: string;
};

export type BuildingBlockParams =
  | ExecSummary
  | RecAndTargetPrice
  | GeneralBlock;

export type Inputs = {
  CONTEXT: string;
  CUSTOM_PROMPT: string;
  COMPANY_NAME: string;
  RECOMMENDATION?: string;
  TARGET_PRICE?: string;
};

export type SummaryInputs = {
  REPORT: string;
};

export type RecAndTargetPriceInputs = {
  CONTEXT: string;
  RECOMMENDATION?: string;
};

const blockIdsMap: Record<string, string> = {
  company_overview: '01-company-overview',
  investment_thesis: '03-investment-thesis',
  business_description: '04-business-description',
  recent_developments: '05-recent-developments',
  financial_analysis: '06-financial-analysis',
  valuation: '09-valuation',
  management: '07-management',
  risks: '08-risks',
  environment_and_sustainability_governance: '10-esg',
  executive_summary: '02-executive-summary',
  targetprice_recommendation: '11-recommendation',
};

function extractOutput(response: string) {
  const log = new Logger();
  // Regular expression to match content between <output> tags
  const pattern = /<output>\s*([\s\S]*?)\s*<\/output>/;
  const match = response.match(pattern);

  if (match) {
    try {
      return match[1];
    } catch (error) {
      console.error('Error: Unable to parse JSON', error);
      // @ts-ignore
      throw new Error(error.message);
    }
  } else {
    log.error('No <output> tags found', { response: response });
    return response.replace(/(.*?)<output>/gs, '').replace('</output>', '');
  }
}

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

async function callAthinaPrompt(
  promptId: string,
  variables: Record<string, any>,
  // model: string = 'gpt-4',
  // parameters: Record<string, any> = {},
) {
  const ATHINA_API_URL = 'https://api.athina.ai/api/v1/prompt';
  const ATHINA_API_KEY = process.env.ATHINA_API_KEY;

  if (!ATHINA_API_KEY) {
    throw new Error('ATHINA_API_KEY is not set in the environment variables');
  }

  try {
    const response = await fetch(`${ATHINA_API_URL}/${promptId}/run`, {
      method: 'POST',
      headers: {
        'athina-api-key': ATHINA_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        variables,
        // version: 1,
        model: 'claude-3-haiku-20240307',
        parameters: {
          temperature: 0.2,
          // max_tokens: 1000,
          // ...parameters,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error.includes('rate_limit_error')) {
        throw new Error('Rate limit error');
      }
      console.log(response);
      console.log('data', data);
      log.error('Error calling Athina API:', {
        status: response.status,
        error: data.error,
        promptId,
        company: variables.COMPANY_NAME,
      });
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    error instanceof Error &&
      log.error('Unexpected error calling Athina API:', {
        error: error.message,
        promptId,
        company: variables.COMPANY_NAME,
      });
    throw error;
  }
}

async function logToAPI(data: any) {
  try {
    const ATHINA_API_KEY = process.env.ATHINA_API_KEY;

    if (!ATHINA_API_KEY) {
      throw new Error('ATHINA_API_KEY is not set in the environment variables');
    }

    const response = await fetch('https://log.athina.ai/api/v1/log/inference', {
      method: 'POST',
      headers: {
        'athina-api-key': ATHINA_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language_model_id: data.prompt.language_model_id,
        prompt: data.prompt.prompt_sent,
        response: data.prompt.prompt_response,
        prompt_tokens: Number(data.prompt.prompt_tokens),
        completion_tokens: Number(data.prompt.completion_tokens),
        total_tokens: Number(data.prompt.total_tokens),
        cost: Number(data.prompt.cost),
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      log.error('Error logging to API:', { ...response, ...data });
    }
  } catch (error) {
    error instanceof Error && log.error('Error logging to API:', { ...error });
    console.error('Error logging to API:', error);
  }
}

export async function generateBlock(
  blockId: string,
  inputs: Inputs | SummaryInputs | RecAndTargetPriceInputs,
  plan: SubscriptionPlan,
) {
  const log = new Logger();

  // try {

  // const anthropic = new Anthropic();

  // const formatInstructions = `\nAfter you've outlined your key points in the scratchpad, write out your response inside <output> tags.`;

  // // @ts-ignore
  // let template = config.chat_template[0].content;

  // Object.entries(inputs).map(([key, value]) => {
  //   template = findReplaceString(template, key, value);
  // });

  const response = await callAthinaPrompt(blockIdsMap[blockId], inputs);

  if (response.status !== 'success') {
    console.log(response);
    log.error('Failed to generate block', {});
    return { content: '', inputToken: 0, outputTokens: 0 };
  }

  // try {
  //   await logToAPI(response.data);
  // } catch (err) {}

  return {
    content: extractOutput(response.data.prompt.prompt_response),
    inputTokens: response.data.prompt.prompt_tokens,
    outputTokens: response.data.prompt.completion_tokens,
  };

  // let model = 'claude-3-5-sonnet-20240620';

  // if (plan === 'dev') {
  //   model = 'claude-3-haiku-20240307';
  // } else if (plan === 'professional' || plan === 'enterprise') {
  //   model = 'claude-3-opus-20240229';
  // }

  // const message = await anthropic.messages.create({
  //   temperature: 0.2,
  //   max_tokens: 4096,
  //   messages: [{ role: 'user', content: template + formatInstructions }],
  //   model: model,
  // });

  // if (!message || !message.content) {
  //   log.error('No content', { blockId, inputs, message });
  // }

  // // https://github.com/anthropics/anthropic-sdk-typescript/issues/432
  // if (message?.content[0]?.type === 'text') {
  //   console.log(message.content[0].text);
  //   humanloop.log({
  //     project_id: humanloopIdsMap[blockId],
  //     config_id: config.id,
  //     inputs: inputs,
  //     // output: message.content[0].text
  //     //   .replace(/(.*?)<output>/gs, '')
  //     //   .replace('</output>', ''),
  //     output: message.content[0].text,
  //   });

  //   return {
  //     // content: message.content[0].text
  //     //   .replace(/(.*?)<output>/gs, '')
  //     //   .replace('</output>', ''),
  //     content: extractOutput(message?.content[0]?.text),
  //     inputTokens: message?.usage?.input_tokens,
  //     outputTokens: message?.usage?.output_tokens,
  //   };
  // } else {
  //   log.error('Wrong Claude output', { blockId, inputs, message });
  //   humanloop.log({
  //     project_id: humanloopIdsMap[blockId],
  //     config_id: config.id,
  //     inputs: inputs,
  //     output: JSON.stringify(message),
  //   });
  //   return {
  //     content: '',
  //     inputTokens: message?.usage?.input_tokens,
  //     outputTokens: message?.usage?.output_tokens,
  //   };
  // }
  // } catch (err) {
  //   throw err;
  // }
}
