import {
  fetchDailyStock,
  fetchOverview,
  fetchWeeklyStock,
} from '@/lib/utils/metrics/financialAPI';
import { METRIC_KEYS } from './metricKeys';
import { MetricsData } from '@/types/metrics';
import { TypedSupabaseClient } from '@/types/supabase';
import { Logger } from 'next-axiom';
import { ServerError } from '@/types/error';
import { serviceClient } from '@/lib/supabase/service';

const log = new Logger();

const downloadYfinanceData = async (ticker: string, timescale: string) => {
  const keys = Object.values(METRIC_KEYS)
    .map((value) => value.map((v) => timescale + v))
    .flat();

  const apiUrl = `https://query2.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/${ticker}?symbol=${ticker}&type=${keys.join(
    ',',
  )}&period1=1483142400&period2=${Math.floor(Date.now() / 1000)}`;

  const res = await fetch(apiUrl);

  if (!res.ok) {
    log.error('Error occurred', {
      error: 'Error fetching yfinance metrics',
      status: res.status,
      res,
      ticker,
    });
    throw new ServerError(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json();

  if (data.timeseries.error) {
    log.error('Error occurred', {
      error: data.timeseries.error,
      message: 'Error fetching yfinance metrics',
      ticker,
    });
    throw new ServerError(`HTTP error! error: ${data.timeseries.error}`);
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
    log.error('Error occurred', {
      error: 'Error fetching polygon metrics',
      status: res.status,
      res,
      ticker,
    });
    throw new ServerError(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json();

  if (data.status !== 'OK') {
    log.error('Error occurred', {
      error: 'Error fetching polygon metrics',
      status: res.status,
      res,
      ticker,
    });
    throw new ServerError(`HTTP error! `);
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

export const fetchApiData = async (
  ticker: string,
  supabase: TypedSupabaseClient,
) => {
  try {
    const { data: cachedData, error } = await supabase
      .from('metrics_cache')
      .select('*')
      .eq('ticker', ticker)
      .maybeSingle();

    if (error) {
      log.error('Error occurred', {
        error,
        path: 'api/metrics/' + ticker,
        fnName: 'fetching company by ticker from metrics_cache',
      });
      throw new ServerError('Error fetching cached api data');
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

        throw new ServerError(
          'Error inserting fetched apiData into metrics_cache',
        );
      }
    }

    const overview = await fetchOverview(ticker);

    const dailyStock = await fetchDailyStock(ticker);

    const weeklyStock = await fetchWeeklyStock(ticker);

    return { ...financialMetrics, overview, dailyStock, weeklyStock };
  } catch (err) {
    if (err instanceof ServerError) {
      throw err;
    } else {
      log.error('Unexpected error', { error: err, fn: 'fetchApiData' });
      throw new ServerError('Unexpected error');
    }
  }
};
