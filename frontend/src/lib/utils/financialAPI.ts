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
