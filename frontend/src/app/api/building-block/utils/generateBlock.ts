import { Humanloop } from 'humanloop';
import Anthropic from '@anthropic-ai/sdk';
import { SubscriptionPlan } from '@/types/subscription';
import { Logger } from 'next-axiom';

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

const humanloopIdsMap: Record<string, string> = {
  company_overview: 'pr_eEsRLn1ueHYu2ohtbLfz8',
  investment_thesis: 'pr_InocnkalxtNTfsiEuFycf',
  business_description: 'pr_9GNKdyMlqcxSm2VAhXd1Q',
  recent_developments: 'pr_IkkvqHAnRftNW74gjqI3s',
  financial_analysis: 'pr_ky4Ib9RjHwHhncWkVkZok',
  valuation: 'pr_M4oPT2h4FumPzvwz78ABa',
  management: 'pr_zkb65gD2Q42TTxTdFTVEa',
  risks: 'pr_TkzimL1MD7xJUMA0wp7yz',
  environment_and_sustainability_governance: 'pr_Hp3kSGo0vlOaS5Yo6pkor',
  executive_summary: 'pr_U4jwcfdNjstPSeWE56IFS',
  targetprice_recommendation: 'pr_8AHpHaePbdFGO13qOemFe',
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

export const generateBlock = async (
  blockId: string,
  inputs: Inputs | SummaryInputs | RecAndTargetPriceInputs,
  plan: SubscriptionPlan,
) => {
  const log = new Logger();

  try {
    if (!process.env.HUMANLOOP_API_KEY) {
      throw new Error('Humanloop api key is required.');
    }

    const anthropic = new Anthropic();

    const humanloop = new Humanloop({
      apiKey: process.env.HUMANLOOP_API_KEY,
    });

    const formatInstructions = `\nAfter you've outlined your key points in the scratchpad, write out your response inside <output> tags.`;

    const config = await humanloop.projects
      .getActiveConfig({
        id: humanloopIdsMap[blockId],
      })
      .then((res) => res.data.config);

    // @ts-ignore
    let template = config.chat_template[0].content;

    Object.entries(inputs).map(([key, value]) => {
      template = findReplaceString(template, key, value);
    });

    // let model = 'claude-3-5-sonnet-20240620';

    // if (plan === 'dev') {
    //   model = 'claude-3-haiku-20240307';
    // } else if (plan === 'professional' || plan === 'enterprise') {
    //   model = 'claude-3-opus-20240229';
    // }

    let model = 'claude-3-haiku-20240307';

    const message = await anthropic.messages.create({
      temperature: 0.2,
      max_tokens: 4096,
      messages: [{ role: 'user', content: template + formatInstructions }],
      model: model,
    });

    if (!message || !message.content) {
      log.error('No content', { blockId, inputs, message });
    }

    // https://github.com/anthropics/anthropic-sdk-typescript/issues/432
    if (message?.content[0]?.type === 'text') {
      console.log(message.content[0].text);
      humanloop.log({
        project_id: humanloopIdsMap[blockId],
        config_id: config.id,
        inputs: inputs,
        // output: message.content[0].text
        //   .replace(/(.*?)<output>/gs, '')
        //   .replace('</output>', ''),
        output: message.content[0].text,
      });

      return {
        // content: message.content[0].text
        //   .replace(/(.*?)<output>/gs, '')
        //   .replace('</output>', ''),
        content: extractOutput(message?.content[0]?.text),
        inputTokens: message?.usage?.input_tokens,
        outputTokens: message?.usage?.output_tokens,
      };
    } else {
      log.error('Wrong Claude output', { blockId, inputs, message });
      humanloop.log({
        project_id: humanloopIdsMap[blockId],
        config_id: config.id,
        inputs: inputs,
        output: JSON.stringify(message),
      });
      return {
        content: '',
        inputTokens: message?.usage?.input_tokens,
        outputTokens: message?.usage?.output_tokens,
      };
    }
  } catch (err) {
    throw err;
  }
};
