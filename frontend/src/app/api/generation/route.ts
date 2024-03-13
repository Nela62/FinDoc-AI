import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse, AnthropicStream } from 'ai';
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set the runtime to edge for best performance
export const runtime = 'edge';

export async function POST(req: Request) {
  const { company, prompt } = await req.json();

  let model = 'OpenAI';
  // Ask OpenAI for a streaming chat completion given the prompt
  if (model === 'OpenAI') {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      // max_tokens: 200,
      temperature: 0.2,
      // top_p: 1,
      // frequency_penalty: 1,
      // presence_penalty: 1,
    });

    return NextResponse.json({ response: response.choices[0].message.content });
  } else if (model === 'Anthropic') {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });

    const response = await anthropic.messages.create({
      messages: [{ role: 'user', content: prompt }],
      // model: 'claude-3-sonnet-20240229',
      model: 'claude-3-opus-20240229',
      max_tokens: 400,
      // temperature: 0.2,
      // top_p: 1,
      // frequency_penalty: 1,
      // presence_penalty: 1,
    });

    return NextResponse.json({ response: response });
  }

  // // Convert the response into a friendly text-stream
  // const stream = OpenAIStream(response);
  // // Respond with the stream
  // return new StreamingTextResponse(stream);
  // console.log(response.choices[0]);
}
