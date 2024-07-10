import { serviceClient } from '@/lib/supabase/service';
import { METRIC_KEYS } from './metricKeys';
import { createClient } from '@/lib/supabase/server';
import { MetricsData } from '@/types/metrics';

const downloadYfinanceData = async (ticker: string, timescale: string) => {
  const keys = Object.values(METRIC_KEYS)
    .map((value) => value.map((v) => timescale + v))
    .flat();

  // If data is not in cache, fetch it
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
  console.log(res);

  if (!res.ok) {
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

export async function GET(
  req: Request,
  { params: { ticker } }: { params: { ticker: string } },
) {
  // Get the URL from the request
  const url = new URL(req.url);

  // Get the search params
  const searchParams = new URLSearchParams(url.search);

  // Get specific query parameters
  const refetch = searchParams.get('refetch');

  try {
    // Check cache
    const supabase = createClient();

    const userRes = await supabase.auth.getUser();

    if (!userRes.data.user && process.env.NODE_ENV !== 'development') {
      return Response.json(
        {
          error: 'Unauthorized access',
          message: 'User not found or invalid credentials',
        },
        { status: 401 },
      );
    }

    if (!refetch) {
      const { data: cachedData, error } = await supabase
        .from('metrics_cache')
        .select('*')
        .eq('ticker', ticker)
        .maybeSingle();

      if (error) {
        throw new Error(
          `Something went wrong when fetching data from cache: ${error}`,
        );
      }

      if (cachedData) {
        return Response.json({
          yfAnnual: cachedData.yf_annual,
          yfQuarterly: cachedData.yf_quarterly,
          ttmData: cachedData.polygon_ttm,
          polygonAnnual: cachedData.polygon_annual,
          polygonQuarterly: cachedData.polygon_quarterly,
        });
      }
    }

    // TODO: if refetch, instead of inserting data, update all metrics to add another item to the array
    const annual = await downloadYfinanceData(ticker, 'annual');
    const quarterly = await downloadYfinanceData(ticker, 'quarterly');
    const { ttmData, annualData, quarterlyData } = await downloadPolygonData(
      ticker,
    );

    // Cache data
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
      throw new Error(
        `Something went wrong when inserting into db: ${error.message}`,
      );
    }

    return Response.json({
      yfAnnual: annual,
      yfQuarterly: quarterly,
      ttmData,
      polygonAnnual: annualData,
      polygonQuarterly: quarterlyData,
    });
  } catch (error) {
    console.error('Error in GET request:', error);

    return Response.json(
      {
        error: 'An error occurred while processing your request',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
