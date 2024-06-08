import { fetchAVEndpoint, fetchDailyStock } from '@/lib/utils/financialAPI';
import {
  BalanceSheet,
  Cashflow,
  DailyStockData,
  Earnings,
  IncomeStatement,
  Overview,
} from '@/types/alphaVantageApi';
import { Recommendation } from '@/types/report';
import { TypedSupabaseClient } from '@/types/supabase';

type ApiData = {
  overview: Overview;
  incomeStatement: IncomeStatement;
  cashflow: Cashflow;
  balanceSheet: BalanceSheet;
  earnings: Earnings;
  dailyStock: DailyStockData;
};

export const fetchCacheAPIData = async (
  reportId: string,
  ticker: string,
  supabase: TypedSupabaseClient,
  userId: string,
  insertCache: any,
): Promise<ApiData> => {
  // TODO: once we have a premium api key, change it to Promise.all
  const overview = await fetchAVEndpoint(
    supabase,
    insertCache,
    reportId,
    userId,
    'OVERVIEW',
    ticker,
  );

  const incomeStatement = await fetchAVEndpoint(
    supabase,
    insertCache,
    reportId,
    userId,
    'INCOME_STATEMENT',
    ticker,
  );

  const cashflow = await fetchAVEndpoint(
    supabase,
    insertCache,
    reportId,
    userId,
    'CASH_FLOW',
    ticker,
  );

  const balanceSheet = await fetchAVEndpoint(
    supabase,
    insertCache,
    reportId,
    userId,
    'BALANCE_SHEET',
    ticker,
  );

  const earnings = await fetchAVEndpoint(
    supabase,
    insertCache,
    reportId,
    userId,
    'EARNINGS',
    ticker,
  );

  const dailyStock = await fetchDailyStock(
    supabase,
    insertCache,
    reportId,
    userId,
    ticker,
  );

  return {
    overview,
    incomeStatement,
    balanceSheet,
    earnings,
    dailyStock,
    cashflow,
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

const getOrgId = async (name: string) => {
  const domain = await fetch(`https://api.brandfetch.io/v2/search/${name}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_BRANDFETCH_API_KEY,
    },
  })
    .then((res) => (res.ok ? res.json() : new Error('Company Logo not found')))
    .then((data) => {
      console.log(data);
      return data[0].domain;
    })
    .catch((err) => console.error(err));

  return domain;
};

const downloadPublicCompanyImg = async (orgId: string): Promise<Blob> => {
  const imgUrl = await fetch(`https://api.brandfetch.io/v2/brands/${orgId}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_BRANDFETCH_API_KEY,
    },
  })
    .then((res) => (res.ok ? res.json() : new Error('Company Logo not found')))
    .then((data) => {
      console.log(data);
      return data.logos.find((logo: any) => logo.type === 'logo')?.formats[0]
        .src;
    })
    .catch((err) => console.error(err));

  const companyLogoBlob = await fetch(imgUrl)
    .then((res) => {
      console.log(res);
      return res.blob();
    })
    .catch((err) => console.error(err));

  if (!companyLogoBlob) {
    throw new Error('An exception occurred when fetching a company logo.');
  }
  return companyLogoBlob;
};

const uploadPublicCompanyImg = async (img: Blob, cik: string) => {
  const formData = new FormData();
  formData.append('img', img);
  formData.append('cik', cik);

  const res = await fetch('/api/images/logo/', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Could not upload image to db');
  }
};

export const getPublicCompanyImg = async (
  supabase: TypedSupabaseClient,
  cik: string,
  website: string | null,
  name: string,
) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Could not find session');
  }

  let companyLogoBlob;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public-company-logos/${cik}/logo.png`,
    {
      method: 'HEAD',
      headers: {
        authorization: session.access_token,
      },
    },
  );

  if (response.ok) {
    let { data } = await supabase.storage
      .from('public-company-logos')
      .download(cik + '/logo.png');

    if (!data) {
      throw new Error(
        'An exception occurred when fetching company logo from supabase.',
      );
    }

    companyLogoBlob = data;
  } else if (website) {
    // fetch logo
    const link = cleanLink(website);
    companyLogoBlob = await downloadPublicCompanyImg(link);
    await uploadPublicCompanyImg(companyLogoBlob, cik);
  } else {
    // fetch domain then fetch logo
    const link = await getOrgId(name);
    companyLogoBlob = await downloadPublicCompanyImg(link);
    await uploadPublicCompanyImg(companyLogoBlob, cik);

    supabase.from('companies').update({ website: link }).eq('cik', cik);
  }
};
