'use server';

import Exa from 'exa-js';

import { serviceClient } from '@/lib/supabase/service';
import { waitForSecJobCompletion } from '@/lib/utils/jobs';
import {
  fetchDailyStock,
  fetchOverview,
  fetchWeeklyStock,
} from '@/lib/utils/metrics/financialAPI';
import { MetricsData } from '@/types/metrics';
import { Logger } from 'next-axiom';
import { METRIC_KEYS } from './metricKeys';
import { createClient } from '@/lib/supabase/server';
import { sub } from 'date-fns';

const log = new Logger();

type ActionResponse =
  | { success: false }
  | {
      success: true;
      data: any;
    };

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

export const getSecFiling = async (ticker: string): Promise<ActionResponse> => {
  'use server';

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/sec-filing/${ticker}/10-K`;

  try {
    const response = await fetch(apiUrl, { cache: 'no-store' });

    if (!response.ok) {
      log.error('Error occurred', {
        message: 'Error when fetching SEC filing',
        ticker,
        response,
      });

      return {
        success: false,
      };
    }

    let data = await response.json();

    if (data.status === 'processing' || data.status === 'pending') {
      await waitForSecJobCompletion(data.job_id);

      // Fetch again after job completion
      const newResponse = await fetch(apiUrl, { cache: 'no-store' });

      if (!newResponse.ok) {
        log.error('Error occurred', {
          message: 'Error when downloading SEC filing',
          ticker,
          newResponse,
        });

        return {
          success: false,
        };
      }

      data = await newResponse.json();
    }

    if (data.status === 'available') {
      return { data: data.xml_path, success: true };
    } else {
      log.error('Error occurred', {
        message: 'Unexpected SEC filing job status',
        ticker,
        status: data.status,
      });

      return { success: false };
    }
  } catch (error) {
    log.error('Unexpected error occurred', {
      error,
      ticker,
      fnName: 'getSecFiling',
    });
    return { success: false };
  }
};

const downloadYfinanceData = async (ticker: string, timescale: string) => {
  const keys = Object.values(METRIC_KEYS)
    .map((value) => value.map((v) => timescale + v))
    .flat();

  const apiUrl = `https://query2.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/${ticker}?symbol=${ticker}&type=${keys.join(
    ',',
  )}&period1=1483142400&period2=${Math.floor(Date.now() / 1000)}`;

  const res = await fetch(apiUrl);

  if (!res.ok) {
    console.log(res);
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json();

  if (data.timeseries.error) {
    throw new Error(`HTTP error! error: ${data.timeseries.error}`);
  }

  const cleanedData: MetricsData = {
    incomeStatement: {},
    balanceSheet: {},
    cashFlow: {},
  };

  data.timeseries.result.forEach((m: any) => {
    const key = Object.keys(m).find((k) => k !== 'meta' && k !== 'timestamp');
    if (!key) return;
    Object.entries(METRIC_KEYS).forEach(([name, arr]) => {
      if (arr.includes(key.replace(timescale, ''))) {
        cleanedData[name as keyof typeof cleanedData][
          key.replace(timescale, '')
        ] = m[key].map((v: any) => ({
          asOfDate: v.asOfDate,
          periodType: v.periodType,
          currency: v.currencyCode,
          value: Number(v.reportedValue.raw),
        }));
      }
    });
  });

  return cleanedData;
};

const downloadPolygonData = async (ticker: string) => {
  const apiUrl = `https://api.polygon.io/vX/reference/financials?ticker=${ticker}&limit=30&apiKey=${process.env.POLYGON_API_KEY}`;

  const res = await fetch(apiUrl);

  if (!res.ok) {
    console.log(res);
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json();

  if (data.status !== 'OK') {
    throw new Error(`HTTP error! `);
  }

  const ttmData = data.results.find(
    (result: any) => result.timeframe === 'ttm',
  );
  const annualData = data.results.filter(
    (result: any) => result.timeframe === 'annual',
  );
  const quarterlyData = data.results.filter(
    (result: any) => result.timeframe === 'quarterly',
  );

  return { ttmData, annualData, quarterlyData };
};

export const fetchApiData = async (ticker: string): Promise<ActionResponse> => {
  'use server';

  try {
    const supabase = createClient();

    const { data: cachedData, error } = await supabase
      .from('metrics_cache')
      .select('*')
      .eq('ticker', ticker)
      .maybeSingle();

    console.log(cachedData);

    if (error) {
      log.error('Error occurred', {
        error,
        path: 'api/metrics/' + ticker,
        fnName: 'fetching company by ticker from metrics_cache',
      });

      return { success: false };
    }

    let financialMetrics;

    if (cachedData) {
      financialMetrics = {
        yfAnnual: cachedData.yf_annual,
        yfQuarterly: cachedData.yf_quarterly,
        ttmData: cachedData.polygon_ttm,
        polygonAnnual: cachedData.polygon_annual,
        polygonQuarterly: cachedData.polygon_quarterly,
      };
    } else {
      // Download and cache api metrics
      const annual = await downloadYfinanceData(ticker, 'annual');
      const quarterly = await downloadYfinanceData(ticker, 'quarterly');
      const { ttmData, annualData, quarterlyData } = await downloadPolygonData(
        ticker,
      );

      financialMetrics = {
        yfAnnual: annual,
        yfQuarterly: quarterly,
        ttmData,
        polygonAnnual: annualData,
        polygonQuarterly: quarterlyData,
      };

      const serviceSupabase = serviceClient();

      const { error } = await serviceSupabase.from('metrics_cache').insert({
        ticker: ticker,
        yf_annual: annual,
        yf_quarterly: quarterly,
        polygon_ttm: ttmData,
        polygon_annual: annualData,
        polygon_quarterly: quarterlyData,
      });

      if (error) {
        log.error('Error occurred', {
          error,
          path: '/api/metrics/' + ticker,
          fnName: 'inserting fetched apiData into metrics_cache',
        });

        return { success: false };
      }
    }

    const overview = await fetchOverview(ticker);

    const dailyStock = await fetchDailyStock(ticker);

    const weeklyStock = await fetchWeeklyStock(ticker);

    return {
      success: true,
      data: { ...financialMetrics, overview, dailyStock, weeklyStock },
    };
  } catch (err) {
    log.error('Unexpected error', { error: err, fn: 'fetchApiData' });
    return { success: false };
  }
};

export async function fetchNews(companyName: string): Promise<ActionResponse> {
  'use server';

  try {
    const exa = new Exa(process.env.EXA_API_KEY);

    // Get press releases from the past year using keyword search
    const press = await exa
      .searchAndContents(companyName + 'press release', {
        type: 'keyword',
        numResults: 15,
        text: true,
        category: 'news',
        startPublishedDate: sub(new Date(), { years: 1 }).toISOString(),
        endPublishedDate: new Date().toISOString(),
      })
      .then((res) => res.results)
      .catch((error) => {
        log.error('Error occurred', {
          error,
          companyName,
          fnName: 'press',
        });
        return [];
      });

    const last3Months = await exa
      .searchAndContents(companyName + 'news', {
        type: 'neural',
        numResults: 25,
        text: true,
        category: 'news',
        useAutoprompt: true,
        startPublishedDate: sub(new Date(), { months: 3 }).toISOString(),
        endPublishedDate: new Date().toISOString(),
      })
      .then((res) => res.results)
      .catch((error) => {
        log.error('Error occurred', {
          error,
          companyName,
          fnName: 'last3Months',
        });
        return [];
      });

    return { data: [...press, ...last3Months], success: true };

    // const last6Months = await exa
    //   .searchAndContents(companyName + 'news', {
    //     type: 'neural',
    //     numResults: 25,
    //     text: true,
    //     category: 'news',
    //     useAutoprompt: true,
    //     startPublishedDate: sub(new Date(), { months: 9 }).toISOString(),
    //     endPublishedDate: sub(new Date(), { months: 3 }).toISOString(),
    //   })
    //   .then((res) => res.results)
    //   .catch((error) => {
    //     log.error('Error occurred', {
    //       error,
    //       companyName,
    //       fnName: 'last6Months',
    //     });
    //     return [];
    //   });

    // const last9Months = await exa
    //   .searchAndContents(companyName + 'news', {
    //     type: 'neural',
    //     numResults: 25,
    //     text: true,
    //     category: 'news',
    //     useAutoprompt: true,
    //     startPublishedDate: sub(new Date(), { months: 18 }).toISOString(),
    //     endPublishedDate: sub(new Date(), { months: 9 }).toISOString(),
    //   })
    //   .then((res) => res.results)
    //   .catch((error) => {
    //     log.error('Error occurred', {
    //       error,
    //       companyName,
    //       fnName: 'last9Months',
    //     });
    //     return [];
    //   });
  } catch (err) {
    log.error('Error occurred', { error: err, fnName: 'fetchNews' });
    return { success: false };
  }
}
