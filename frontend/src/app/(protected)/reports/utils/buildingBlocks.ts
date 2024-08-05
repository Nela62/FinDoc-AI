import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';
import { SubscriptionPlan } from '@/types/subscription';
import { Logger } from 'next-axiom';
import OpenAI from 'openai';
import { ApiData } from './apiData';

const log = new Logger();
const openai = new OpenAI();

type BlockType =
  | 'summary'
  | 'recommendation_and_target_price'
  | 'company_analysis'
  | string;

interface BuildingBlockParams {
  blockId: string;
  plan: SubscriptionPlan;
  apiData: ApiData;
  newsContext: string;
  companyName: string;
  ticker: string;
  recommendation?: string;
  targetPrice?: string;
}

const LOGGING_API_URL =
  process.env.LOGGING_API_URL || 'https://api.example.com/log';

async function useAthinaPrompt(
  promptId: string,
  variables: Record<string, any>,
  model: string = 'gpt-4',
  parameters: Record<string, any> = {},
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
        version: 1,
        model,
        parameters: {
          temperature: 1,
          max_tokens: 1000,
          ...parameters,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling Athina API:', error);
    throw error;
  }
}

async function logToAPI(data: any) {
  try {
    const response = await fetch(LOGGING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error logging to API:', error);
  }
}

export async function generateBuildingBlock(params: BuildingBlockParams) {
  const supabase = createClient();
  const serviceSupabase = serviceClient();

  const {
    blockId,
    plan,
    apiData,
    companyName,
    ticker,
    recommendation,
    targetPrice,
  } = params;

  let prompt: string;
  let systemMessage: string;
  let blockType: BlockType;

  // Determine block type and set appropriate prompts
  if (blockId.includes('summary')) {
    blockType = 'summary';
    systemMessage = `You are an AI assistant tasked with creating a summary for ${companyName}.`;
    prompt = `Create a concise summary for ${companyName} (${ticker}) based on the following data: ${JSON.stringify(
      apiData,
    )}`;
  } else if (blockId.includes('recommendation')) {
    blockType = 'recommendation_and_target_price';
    systemMessage = `You are an AI assistant tasked with providing a stock recommendation and target price for ${companyName}.`;
    prompt = `Based on the following data, provide a stock recommendation and target price for ${companyName} (${ticker}): ${JSON.stringify(
      apiData,
    )}. Current recommendation: ${recommendation}, Current target price: ${targetPrice}`;
  } else if (blockId.includes('analysis')) {
    blockType = 'company_analysis';
    systemMessage = `You are an AI assistant tasked with providing a detailed analysis of ${companyName}.`;
    prompt = `Provide a detailed analysis of ${companyName} (${ticker}) based on the following data: ${JSON.stringify(
      apiData,
    )}`;
  } else {
    throw new Error(`Unknown block type for blockId: ${blockId}`);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: plan === 'pro' ? 'gpt-4' : 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt },
      ],
    });

    const generatedContent = completion.choices[0].message.content;

    // Log the interaction
    await logToApi({
      language_model_id: plan === 'pro' ? 'gpt-4' : 'gpt-3.5-turbo',
      prompt: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt },
      ],
      response: generatedContent,
      user_query: prompt,
      context: {
        information: [JSON.stringify(apiData)],
      },
      prompt_tokens: completion.usage?.prompt_tokens,
      completion_tokens: completion.usage?.completion_tokens,
      total_tokens: completion.usage?.total_tokens,
      prompt_slug: `generate_${blockType}`,
      environment: process.env.NODE_ENV,
      customer_id: params.plan,
    });

    // Store the generated content
    const { error } = await serviceSupabase
      .from('building_blocks')
      .upsert({ id: blockId, content: generatedContent }, { onConflict: 'id' });

    if (error) {
      throw error;
    }

    return generatedContent;
  } catch (error) {
    log.error('Error generating building block', {
      error,
      blockId,
      companyName,
    });
    throw error;
  }
}
