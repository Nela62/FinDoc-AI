'use server';

import { serviceClient } from '@/lib/supabase/service';
import { waitForSecJobCompletion } from '@/lib/utils/jobs';
import { fetchDailyStock, fetchOverview, fetchWeeklyStock } from '@/lib/utils/metrics/financialAPI';
import { Logger } from 'next-axiom';

const log = new Logger();

export async function fetchNewsContent(url: string) {
  const jsdom = require('jsdom');
  const { JSDOM } = jsdom;

  const supabase = serviceClient();

  const { data, error } = await supabase
    .from('news_cache')
    .select('*')
    .eq('url', url)
    .maybeSingle();

  if (data) {
    return data.content;
  }

  const content = await fetch(url)
    .then((response) => response.text())
    .then((html) => {
      const dom = new JSDOM(html);
      const paragraphs = dom.window.document.querySelectorAll('p');
      const articleContent = Array.from(paragraphs).map(
        (p: any) => p.textContent,
      );

      return articleContent.join();
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  await supabase.from('news_cache').insert({ url, content });

  return content;
}

export const getSecFiling = async (ticker: string): Promise<string> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/sec-filing/${ticker}/10-K`;

  try {
    const response = await fetch(apiUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(
        `Error when fetching SEC filing! status: ${response.status}`,
      );
    }

    let data = await response.json();

    if (data.status === 'processing' || data.status === 'pending') {
      await waitForSecJobCompletion(data.job_id);

      // Fetch again after job completion
      const newResponse = await fetch(apiUrl, { cache: 'no-store' });

      if (!newResponse.ok) {
        throw new Error(
          `Error when downloading SEC filing! status: ${newResponse.status}`,
        );
      }

      data = await newResponse.json();
    }

    if (data.status === 'available') {
      return data.xml_path;
    } else {
      throw new Error(`Unexpected SEC filing job status: ${data.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const fetchApiData = async (ticker: string) => {
  'use server';

  try {
    const res = await fetch(`/api/metrics/${ticker}`);

    if (res.status !== 200) {
      return { success: false };
    } else {
      const financialMetrics = await res.json();

      const overview = await fetchOverview(ticker);

      const dailyStock = await fetchDailyStock(ticker);

      const weeklyStock = await fetchWeeklyStock(ticker);
      
      return { success: true, data: {...financialMetrics, overview, dailyStock, weeklyStock} };
    }
  } catch (err) {
    log.error('Unexpected error', { error: err, fn: 'fetchApiData' });
    return { success: false };
  }
};
