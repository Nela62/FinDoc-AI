import { serviceClient } from '@/lib/supabase/service';
import { METRIC_KEYS } from './metricKeys';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  req: Request,
  { params: { ticker } }: { params: { ticker: string } },
) {
  // Get the URL from the request
  const url = new URL(req.url);

  // Get the search params
  const searchParams = new URLSearchParams(url.search);

  // Get specific query parameters
  const timescale = searchParams.get('timescale');

  if (timescale !== 'annual' && timescale !== 'quarterly') {
    return Response.json(
      { error: 'Timescale must be "annual" or "quarterly".' },
      { status: 400 },
    );
  }

  try {
    // Check cache
    const supabase = createClient();

    const userRes = await supabase.auth.getUser();

    if (!userRes.data.user) {
      return Response.json(
        {
          error: 'Unauthorized access',
          message: 'User not found or invalid credentials',
        },
        { status: 401 },
      );
    }

    const { data: cachedData, error } = await supabase
      .from('metrics_cache')
      .select('*')
      .eq('ticker', ticker)
      .eq('timescale', timescale);

    const keys = Object.values(METRIC_KEYS)
      .map((value) => value.map((v) => timescale + v))
      .flat();

    if (error) {
      return Response.json(
        {
          error: `Something went wrong when fetching data from cache: ${error}`,
        },
        { status: 400 },
      );
    }

    if (cachedData && cachedData.length > 0) {
      return Response.json({ data: cachedData[0].data });
    }

    // If data is not in cache, fetch it
    const apiUrl = `https://query2.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/${ticker}?symbol=${ticker}&type=${keys.join(
      ',',
    )}&period1=1483142400&period2=${Math.floor(Date.now() / 1000)}`;

    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    if (data.timeseries.error) {
      throw new Error(`HTTP error! error: ${data.timeseries.error}`);
    }

    const cleanedData: Record<string, Record<string, number>[]> = {
      incomeStatement: [],
      balanceSheet: [],
      cashFlow: [],
    };

    data.timeseries.result.forEach((m: any) => {
      const key = Object.keys(m).find((k) => k !== 'meta' && k !== 'timestamp');
      if (!key) return;
      Object.entries(METRIC_KEYS).forEach(([name, arr]) => {
        if (arr.includes(key.replace('annual', ''))) {
          cleanedData[name].push({
            [key]: m[key].map((v: any) => Number(v.reportedValue.raw)),
          });
        }
      });
    });

    // Cache data
    const serviceSupabase = serviceClient();

    await serviceSupabase
      .from('metrics_cache')
      .insert([{ ticker: ticker, timescale: timescale, data: cleanedData }]);

    return Response.json({ data: cleanedData });
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
