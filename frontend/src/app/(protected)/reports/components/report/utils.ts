import { Params } from '@/app/api/building-block/utils/blocks';
import { capitalizeWords } from '@/lib/utils/formatText';
import { createJob, Job, waitForJobCompletion } from '@/lib/utils/jobs';
import { Overview } from '@/types/alphaVantageApi';
import { Dispatch, SetStateAction } from 'react';
import { getRecommendation } from '../../utils/fetchAPI';

export const getRecAndTargetPrice = async (
  providedRec: string | undefined,
  providedTP: number | undefined,
  overview: Overview,
  params: Params,
  setJobs: Dispatch<SetStateAction<Record<string, Job>>>,
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
        const recAndTargetPriceJob = await createJob(params, setJobs);

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
