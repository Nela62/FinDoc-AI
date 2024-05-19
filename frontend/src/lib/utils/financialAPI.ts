import { eachDayOfInterval, format, max, sub } from 'date-fns';
import { TypedSupabaseClient } from '@/types/supabase';
import { fetchAPICacheByEndpoint } from '../queries';

async function fetchAndCache(
  client: TypedSupabaseClient,
  insertCache: any,
  reportId: string,
  userId: string,
  endpoint: string,
) {
  try {
    const res = await fetch('https://www.alphavantage.co/' + endpoint);
    const json = await res.json();
    await insertCache({
      report_id: reportId,
      user_id: userId,
      json_data: json,
      endpoint: endpoint,
      api_provider: 'alpha_vantage',
    });
    return json;
  } catch (err) {
    console.log(err);
  }
}

export async function fetchDailyStock(
  client: TypedSupabaseClient,
  insertCache: any,
  reportId: string,
  userId: string,
  symbol: string,
) {
  const endpoint = `query?function=TIME_SERIES_DAILY&symbol=${symbol}&apiKey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}&outputsize=full`;

  const { data } = await fetchAPICacheByEndpoint(
    client,
    reportId,
    endpoint,
    'alpha_vantage',
  );

  if (!data) return;

  if (data.length === 0) {
    return await fetchAndCache(client, insertCache, reportId, userId, endpoint);
  } else {
    // return json
    return data[0].json_data;
  }
}

type DailyData = {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
};

type StockMetadata = {
  '1. Information': string;
  '2. Symbol': string;
  '3. Last Refreshed': string;
  '4. Output Size': string;
  '5. Time Zone': string;
};

type DailyTimeSeries = { [date: string]: DailyData };

type DailyStockData = {
  'Meta Data': StockMetadata;
  'Time Series (Daily)': DailyTimeSeries;
};

const getNWeeksStock = (dailyStock: DailyStockData, weeks: number = 52) => {
  const data = dailyStock['Time Series (Daily)'];
  const nWeeksAgo = sub(new Date(), { weeks: weeks });
  const days = eachDayOfInterval({ start: nWeeksAgo, end: new Date() });

  const stockData: DailyTimeSeries[] = [];

  days.forEach((day) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    if (data.hasOwnProperty(formattedDay)) {
      stockData.push({ [formattedDay]: data[formattedDay] });
    }
  });

  console.log(stockData);

  return stockData;
};

const getLatestStockData = (stockData: DailyTimeSeries) => {
  const lastDate = max(Object.keys(stockData));
  console.log(lastDate);
  return stockData[format(lastDate, 'yyyy-MM-dd')];
};
