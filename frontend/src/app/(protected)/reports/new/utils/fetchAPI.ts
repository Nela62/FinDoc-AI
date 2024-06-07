import { fetchAVEndpoint, fetchDailyStock } from '@/lib/utils/financialAPI';
import { Overview } from '@/types/alphaVantageApi';
import { Recommendation } from '@/types/report';
import { TypedSupabaseClient } from '@/types/supabase';

export const fetchCacheAPIData = async (
  reportId: string,
  ticker: string,
  supabase: TypedSupabaseClient,
  userId: string,
  insertCache: any,
) => {
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
