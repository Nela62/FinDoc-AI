import { ServerError } from '@/types/error';
import { fetchApiData, fetchNews, getSecFiling } from './actions';
import { createClient } from '@/lib/supabase/client';
import { SearchResult } from 'exa-js';

const supabase = createClient();

export const handleApiData = async (
  ticker: string,
  reportId: string,
  userId: string,
  setPolygonApi: (data: any) => void,
  nextStep: () => void,
) => {
  const res = await fetchApiData(ticker);

  if (!res.success) {
    throw new ServerError('Could not fetch api data');
  }

  const apiData = res.data;

  await supabase.from('api_cache').insert([
    {
      user_id: userId,
      overview: apiData.overview,
      stock: apiData.dailyStock,
      report_id: reportId,
    },
  ]);

  setPolygonApi({
    annual: apiData.polygonAnnual,
    quarterly: apiData.polygonQuarterly,
    stock: apiData.dailyStock,
  });

  nextStep();

  return apiData;
};

export const handleSecFiling = async (
  ticker: string,
  nextStep: () => void,
  log: any,
) => {
  const res = await getSecFiling(ticker);

  if (!res.success) {
    throw new ServerError('Could not fetch SEC filings');
  }

  const xmlPath = res.data;

  const xml = await supabase.storage
    .from('sec-filings')
    .download(xmlPath)
    .then((res) => res.data?.text());

  nextStep();

  if (!xml) {
    log.error('Error occurred', {
      message: 'Sec filing text is empty',
      ticker,
      xmlPath,
    });
  }

  return xml;
};

export async function handleNews(companyName: string, nextStep: () => void) {
  const res = await fetchNews(companyName);

  if (!res.success) {
    throw new ServerError('Could not fetch news');
  }

  const news = res.data;

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

  nextStep();

  return { sources, context };
}
