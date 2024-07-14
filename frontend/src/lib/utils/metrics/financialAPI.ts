import { Overview } from '@/types/alphaVantageApi';

// Alpha Vantage API
export async function fetchNews(
  ticker: string,
  timeFrom: string,
  timeTo: string,
) {
  // Time should be in this format: 20240312T0000
  const endpoint = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${ticker}&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}&time_from=${timeFrom}&time_to=${timeTo}&sort=RELEVANCE&limit=15`;

  const res = await fetch(endpoint);

  if (!res.ok) throw new Error('Could not fetch news');

  return res.json();
}

export async function fetchDailyStock(ticker: string) {
  const endpoint = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}&outputsize=full`;

  const res = await fetch(endpoint);

  if (!res.ok) throw new Error('Could not fetch stock data');

  return res.json();
}

export async function fetchWeeklyStock(ticker: string) {
  const endpoint = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=${ticker}&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}&outputsize=full`;

  const res = await fetch(endpoint);

  if (!res.ok) throw new Error('Could not fetch stock data');

  return res.json();
}

export async function fetchOverview(ticker: string): Promise<Overview> {
  const endpoint = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}`;

  const res = await fetch(endpoint);

  if (!res.ok) throw new Error('Could not fetch stock data');

  return res.json();
}
