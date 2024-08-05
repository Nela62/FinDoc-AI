import { fetchNews } from '@/lib/utils/metrics/financialAPI';
import { NewsData, Overview } from '@/types/alphaVantageApi';
import { Recommendation } from '@/types/report';
import { TypedSupabaseClient } from '@/types/supabase';
import { format, subMonths } from 'date-fns';

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
