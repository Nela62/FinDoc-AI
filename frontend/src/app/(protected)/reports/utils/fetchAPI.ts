import { fetchDailyStock, fetchNews } from '@/lib/utils/financialAPI';
import {
  BalanceSheet,
  Cashflow,
  DailyStockData,
  Earnings,
  IncomeStatement,
  NewsData,
  Overview,
} from '@/types/alphaVantageApi';
import { Recommendation } from '@/types/report';
import { TypedSupabaseClient } from '@/types/supabase';
import { format, subMonths } from 'date-fns';

type ApiData = {
  overview: Overview;
  incomeStatement: IncomeStatement;
  cashflow: Cashflow;
  balanceSheet: BalanceSheet;
  earnings: Earnings;
  dailyStock: DailyStockData;
};

type NewsDataRes = {
  last3Months: NewsData;
  last6Months: NewsData;
  last12Months: NewsData;
};

const formatDate = (date: Date) => {
  return format(date, "yyyyMMdd'T'HHmm");
};

export const fetchAllNews = async (ticker: string): Promise<NewsDataRes> => {
  const last3Months = await fetchNews(
    ticker,
    formatDate(new Date()),
    formatDate(subMonths(new Date(), 3)),
  );

  const last6Months = await fetchNews(
    ticker,
    formatDate(subMonths(new Date(), 3)),
    formatDate(subMonths(new Date(), 6)),
  );

  const last12Months = await fetchNews(
    ticker,
    formatDate(subMonths(new Date(), 6)),
    formatDate(subMonths(new Date(), 12)),
  );

  return {
    last3Months,
    last6Months,
    last12Months,
  };
};

export const getRecommendation = (overview: Overview): Recommendation => {
  const {
    AnalystRatingStrongBuy,
    AnalystRatingBuy,
    AnalystRatingHold,
    AnalystRatingSell,
    AnalystRatingStrongSell,
  } = overview;

  const ratings = {
    AnalystRatingStrongBuy,
    AnalystRatingBuy,
    AnalystRatingHold,
    AnalystRatingSell,
    AnalystRatingStrongSell,
  };

  const largestRatingVariable = Object.keys(ratings).reduce((a, b) =>
    Number(ratings[a as keyof typeof ratings]) >
    Number(ratings[b as keyof typeof ratings])
      ? a
      : b,
  );

  switch (largestRatingVariable) {
    case 'AnalystRatingStrongBuy':
      return 'Buy';
    case 'AnalystRatingBuy':
      return 'Overweight';
    case 'AnalystRatingHold':
      return 'Hold';
    case 'AnalystRatingSell':
      return 'Underweight';
    case 'AnalystRatingStrongSell':
      return 'Sell';
    default:
      throw new Error(largestRatingVariable + ' is not Recommendation type.');
  }
};

export const getFinancialStrength = () => {};

export const cleanLink = (link: string) => {
  let cleanLink = link;

  if (cleanLink.startsWith('http://')) {
    cleanLink = cleanLink.slice(7);
  }
  if (cleanLink.startsWith('www.')) {
    cleanLink = cleanLink.slice(4);
  }

  return cleanLink;
};

const uploadPublicCompanyImg = async (
  src: string,
  cik: string,
  format: string,
  name: string,
  index: number,
) => {
  const res = await fetch('/api/images/logo/', {
    method: 'POST',
    body: JSON.stringify({ src, cik, format, name, index }),
  });

  if (!res.ok) {
    throw new Error(`Could not upload image ${name} to db`);
  }
};

export const downloadPublicCompanyImgs = async (
  cik: string,
  updateTickers: any,
  tickers: {
    id: string;
    cik: string;
    company_name: string;
    stock_name: string;
    label: string;
    ticker: string;
    website: string | null;
  }[],
  orgId: string | null,
  supabase: TypedSupabaseClient,
) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error('Session not found');
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public-company-logos/${cik}/exists`,
    {
      method: 'HEAD',
      headers: {
        authorization: session.access_token,
      },
    },
  );

  console.log(response);

  if (response.ok) return;

  if (!orgId) {
    orgId = await fetch(`https://api.brandfetch.io/v2/search/${orgId}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_BRANDFETCH_API_KEY,
      },
    })
      .then((res) => res.json())
      .then((data) => data[0].domain)
      .catch((err) => console.error(err));

    updateTickers(tickers.map((ticker) => ({ id: ticker.id, website: orgId })));
  }
  const images = await fetch(
    `https://api.brandfetch.io/v2/brands/${cleanLink(orgId || '')}`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_BRANDFETCH_API_KEY,
      },
    },
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  images.logos.forEach(async (img: any, index: number) => {
    if (img.type === 'other') return;

    const format =
      img.formats.find((format: any) => format.format === 'png') ??
      img.formats[0];
    await uploadPublicCompanyImg(
      format.src,
      cik,
      format.format,
      `${img.theme}-${img.type}`,
      index,
    );
  });
};
