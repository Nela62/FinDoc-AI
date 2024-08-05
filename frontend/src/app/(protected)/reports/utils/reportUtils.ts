import { z } from 'zod';
import { format } from 'date-fns';

import { getNanoId } from '@/lib/utils/nanoId';
import { TypedSupabaseClient } from '@/types/supabase';
import { reportFormSchema } from '../components/report/ReportForm';
import { section_ids } from './generateReportSections';
import { Logger } from 'next-axiom';
import { Overview } from '@/types/alphaVantageApi';
import { Recommendation } from '@/types/report';
import { capitalizeWords } from '@/lib/utils/formatText';

const log = new Logger();

export async function getUserId(
  supabase: TypedSupabaseClient,
): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw new Error('An exception occurred when getting the user id.');
  }
  return data.user.id;
}

export async function createNewReport(
  values: z.infer<typeof reportFormSchema>,
  userId: string,
  supabase: TypedSupabaseClient,
): Promise<string> {
  const nanoId = getNanoId();

  const { data, error } = await supabase
    .from('reports')
    .insert({
      title: `${values.companyTicker.value} - ${values.reportType} - ${format(
        new Date(),
        'd MMM yyyy',
      )}`,
      company_ticker: values.companyTicker.value,
      url: nanoId,
      type: values.reportType,
      recommendation: values.recommendation,
      targetprice: values.targetPrice,
      status: 'Draft',
      user_id: userId,
      section_ids,
    })
    .select();

  if (error) {
    log.error('Error creating new report', {
      error,
      fnName: 'createNewReport',
      fnProps: { values, userId },
    });
    throw new Error('An exception occurred when creating a new report.');
  }

  return data[0].id;
}

export type TickerData = {
  ticker: string;
  company_name: string;
  stock_name: string;
  cik: string;
  website: string | null;
  currency: string | null;
  exchange: string | null;
  country: string | null;
};

export async function getTickerData(
  ticker: string,
  supabase: TypedSupabaseClient,
): Promise<TickerData> {
  const tickerData = await supabase
    .from('companies')
    .select('*')
    .eq('ticker', ticker)
    .maybeSingle();

  if (!tickerData?.data) {
    log.error('Error occurred', {
      message: `Company name for ticker ${ticker} was not found.`,
      ticker,
    });
    throw new Error(`Company name for ticker ${ticker} was not found.`);
  }

  return tickerData.data;
}

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

export const getRecAndTargetPrice = async (
  providedRec: string | undefined,
  providedTP: number | undefined,
  overview: Overview,
  params: Params,
) => {
  let recommendation;
  let targetPrice;

  try {
    if (providedRec && providedRec !== 'Auto') {
      recommendation = providedRec;

      if (providedTP) {
        targetPrice = providedTP;

        return { recommendation, targetPrice };
      } else {
        const recAndTargetPriceJob = await createJob(params);

        const res = await waitForJobCompletion(recAndTargetPriceJob);

        const data = JSON.parse(res);

        return {
          recommendation: capitalizeWords(data.recommendation),
          targetPrice: data.target_price,
        };
      }
    } else if (overview.AnalystTargetPrice !== 'None') {
      recommendation = getRecommendation(overview);
      targetPrice = Number(overview.AnalystTargetPrice);
      return { recommendation, targetPrice };
    } else {
      const recAndTargetPriceJob = await createJob(params, setJobs);

      const res = await waitForJobCompletion(recAndTargetPriceJob);

      const data = JSON.parse(res);

      return {
        recommendation: capitalizeWords(data.recommendation),
        targetPrice: data.target_price,
      };
    }
  } catch (err) {
    throw err;
  }
};
