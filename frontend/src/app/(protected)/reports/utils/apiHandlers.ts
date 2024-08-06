import { ServerError } from '@/types/error';
import { SearchResult } from 'exa-js';
import { TypedSupabaseClient } from '@/types/supabase';
import { ApiData, fetchApiData } from './apiData';
import { fetchSecFiling } from './secFilings';
import { Logger } from 'next-axiom';
import { fetchNews } from './news';

const log = new Logger();

export const getApiData = async (
  ticker: string,
  reportId: string,
  userId: string,
  supabase: TypedSupabaseClient,
) => {
  const apiData: ApiData = await fetchApiData(ticker, supabase);

  await supabase.from('api_cache').insert([
    {
      user_id: userId,
      overview: apiData.overview,
      stock: apiData.dailyStock,
      report_id: reportId,
    },
  ]);

  return apiData;
};

export const getSecFiling = async (
  ticker: string,
  supabase: TypedSupabaseClient,
) => {
  const res = await fetchSecFiling(ticker);

  const xmlPath = res.data;

  const xml = await supabase.storage
    .from('sec-filings')
    .download(xmlPath)
    .then((res) => res.data?.text());

  if (!xml) {
    log.error('Error occurred', {
      message: 'Sec filing text is empty',
      ticker,
      xmlPath,
    });
  }

  return xml;
};

export async function getNews(companyName: string) {
  const news = await fetchNews(companyName);

  const context = news.map((article: SearchResult) => ({
    title: article.title,
    content: article.text,
    url: article.url,
    published_date: article.publishedDate,
  }));

  const sources = [];
  sources.push(
    `[1] ${companyName}, "Form 10-K," Securities and Exchance Comission, Washington, D.C., 2024.`,
  );

  news.map((article: SearchResult) => {
    sources.push(
      `[${sources.length + 1}] ${article.author}, "${article.title}"${
        article.publishedDate ? ', ' + article.publishedDate : ''
      }. Available at ${article.url}`,
    );
  });

  return { sources, context };
}
