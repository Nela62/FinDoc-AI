import { createClient } from '@/lib/supabase/server';
import { METRIC_KEYS } from './metricKeys';

type Data = {
  incomeStatement: Record<string, number>[];
  balanceSheet: Record<string, number>[];
  cashFlow: Record<string, number>[];
};

export async function GET(
  req: Request,
  { params: { ticker } }: { params: { ticker: string } },
) {
  const keys = Object.entries(METRIC_KEYS)
    .map(([key, value]) => value.map((v) => 'annual' + v))
    .flat();

  try {
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
    const nonEmptyData: Record<string, string | number>[] = [];
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
            [key]: m[key].map((v: any) => v.reportedValue.raw),
          });
        }
      });

      // nonEmptyData.push({ [key]: m[key].map((v: any) => v.reportedValue.raw) });
    });

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
