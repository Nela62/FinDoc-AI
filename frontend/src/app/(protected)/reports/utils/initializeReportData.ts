'use server';

import { z } from 'zod';
import { reportFormSchema } from '../components/report/ReportForm';
import {
  createNewReport,
  getRecAndTargetPrice,
  getTickerData,
  getUserId,
} from './reportUtils';
import { createClient } from '@/lib/supabase/server';
import { Logger } from 'next-axiom';
import { getApiData, getNews, getSecFiling } from './apiHandlers';
import { SubscriptionPlan } from '@/types/subscription';
import { generateMetrics } from '@/lib/utils/metrics/generateMetrics';
import { createJob, waitForJobCompletion } from './jobs';

const handleError = (error: any) => {};

const log = new Logger();

type InitializeReportDataProps = {
  values: z.infer<typeof reportFormSchema>;
  plan: SubscriptionPlan;
};

export const initializeReportData = async ({
  values,
  plan,
}: InitializeReportDataProps) => {
  'use server';

  try {
    const supabase = createClient();
    const userId = await getUserId(supabase);

    log.info('Generating new report', {
      ticker: values.companyTicker.value,
      userId: userId,
    });

    const reportId = await createNewReport(values, userId, supabase);
    const tickerData = await getTickerData(
      values.companyTicker.value,
      supabase,
    );

    const [apiData, xml, { sources, context: newsContext }] = await Promise.all(
      [
        getApiData(values.companyTicker.value, reportId, userId, supabase),
        getSecFiling(values.companyTicker.value, supabase),
        getNews(tickerData.company_name),
      ],
    );

    const { recommendation, targetPrice } = await getRecAndTargetPrice(
      values.recommendation,
      values.targetPrice,
      apiData.overview,
      {
        blockId: 'targetprice_recommendation',
        plan,
        apiData,
        recommendation: values.recommendation,
        companyName: tickerData.company_name,
      },
    );

    const financialStrength =
      values.financialStrength && values.financialStrength !== 'Auto'
        ? values.financialStrength
        : 'Medium';

    await supabase
      .from('reports')
      .update({
        recommendation: recommendation,
        targetprice: targetPrice,
        financial_strength: financialStrength,
      })
      .eq('id', reportId);

    const metrics = generateMetrics(apiData, targetPrice, financialStrength);

    const companyOverviewJobId = await createJob({
      blockId: 'company_overview',
      plan,
      companyName: tickerData.company_name,
      apiData: apiData,
      xmlData: xml ?? '',
      newsData: JSON.stringify(newsContext),
      customPrompt: '',
    });

    const companyOverview = await waitForJobCompletion(companyOverviewJobId);
  } catch (error) {
    handleError(error);
  }
};
