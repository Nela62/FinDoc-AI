import { sub } from 'date-fns';
import Exa from 'exa-js';
import { Logger } from 'next-axiom';
import { NextResponse } from 'next/server';

const log = new Logger();

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Get the search params
  const searchParams = new URLSearchParams(url.search);

  // Get specific query parameters
  const companyName = searchParams.get('companyName');

  try {
    const exa = new Exa(process.env.EXA_API_KEY);

    const { results: last3Months } = await exa.searchAndContents(
      companyName + ' news',
      {
        type: 'neural',
        numResults: 25,
        text: true,
        category: 'news',
        useAutoprompt: true,
        startPublishedDate: sub(new Date(), { months: 3 }).toISOString(),
        endPublishedDate: new Date().toISOString(),
      },
    );

    const news = [...last3Months];

    return NextResponse.json(news);
  } catch (error) {
    error instanceof Error &&
      log.error('Error occurred', {
        ...error,
        companyName: companyName,
        fnName: '/api/news',
      });

    return NextResponse.json(
      {
        error: 'An error occurred while processing your request',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
