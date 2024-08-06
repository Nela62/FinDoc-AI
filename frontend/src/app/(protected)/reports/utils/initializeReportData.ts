'use server';

import { z } from 'zod';
import { reportFormSchema } from '../components/report/ReportForm';
import {
  createNewReport,
  getRecAndTargetPrice,
  getTickerData,
  getUserId,
  TickerData,
} from './reportUtils';
import { createClient } from '@/lib/supabase/server';
import { Logger } from 'next-axiom';
import { getApiData, getNews, getSecFiling } from './apiHandlers';
import { SubscriptionPlan } from '@/types/subscription';
import { generateMetrics } from '@/lib/utils/metrics/generateMetrics';
import { ServerError } from '@/types/error';
import { downloadPublicCompanyImgs } from './downloadCompanyLogos';
import { TemplateConfig } from '../components/NewReport';
import { createJob, waitForJobCompletion } from './jobs';
import { ApiData } from './apiData';

const defaultCompanyLogo = '/default_findoc_logo.png';

const log = new Logger();

const handleError = (error: any) => {
  if (error instanceof ServerError) {
  } else {
    log.error('Unexpected error', { error, fnName: 'initializeReportData' });
  }
  console.error(error);
};

export type InitializeReportDataProps = {
  values: z.infer<typeof reportFormSchema>;
  plan: SubscriptionPlan;
  templateConfig: TemplateConfig;
};

export type InitializeReportDataResponse = {
  apiData: ApiData;
  tickerData: TickerData;
  reportId: string;
  templateId: string;
  companyOverview: string;
  recommendation: string;
  targetPrice: string;
  newsContext: string;
  xml: string;
};

export const initializeReportData = async ({
  values,
  plan,
  templateConfig,
}: InitializeReportDataProps): Promise<InitializeReportDataResponse> => {
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
    console.log('generating company overview');

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
    // const companyOverview = '';

    console.log('downloading company logos');

    await downloadPublicCompanyImgs(tickerData);

    const { data, error } = await supabase
      .from('report_template')
      .insert({
        user_id: userId,
        report_id: reportId,
        template_type: 'equity-analyst-sidebar',
        business_description: companyOverview,
        color_scheme: templateConfig.colorScheme.colors,
        author_name: templateConfig.authorName,
        author_company_name: templateConfig.authorCompanyName,
        author_company_logo:
          templateConfig.authorCompanyLogo === defaultCompanyLogo
            ? null
            : templateConfig.authorCompanyLogo,
        metrics: { ...metrics, sources },
      })
      .select();

    if (error) {
      log.error('Failed to create report template', { error });
      throw new ServerError('Failed to create report template');
    }

    return {
      apiData,
      tickerData,
      reportId,
      templateId: data[0].id,
      companyOverview: companyOverview,
      recommendation,
      targetPrice,
      newsContext: JSON.stringify(newsContext),
      xml: xml ?? '',
    };
  } catch (error) {
    handleError(error);
    throw error;
  }
};
