import { Session } from '@supabase/supabase-js';
import { Logger } from 'next-axiom';
import { SubscriptionPlan } from '@/types/subscription';

export const section_ids = [
  'investment_thesis',
  'business_description',
  'recent_developments',
  'management',
  'risks',
  'financial_analysis',
  'valuation',
];

export const generateReportSections = async (
  session: Session,
  reportId: string,
  ticker: string,
  companyName: string,
  apiData: any,
  plan: string,
  baseUrl: string,
  log: Logger,
) => {
  // const jobIds = await Promise.all(
  //   section_ids.map(async (id: string) => {
  //     const jobId = await createJob(
  //       {
  //         blockId: id as Block,
  //         recommendation: apiData.recommendation,
  //         targetPrice: apiData.targetPrice.toString(),
  //         plan: plan as SubscriptionPlan,
  //         companyName,
  //         apiData,
  //         xmlData: apiData.xml ?? '',
  //         newsData: apiData.newsContext,
  //         customPrompt: '',
  //       },
  //       () => {}, // You might want to pass a proper setJobs function here
  //     );
  //     return { blockId: id, id: jobId };
  //   }),
  // );
  // const generatedBlocks = await waitForAllJobs(jobIds);
  // log.info('Generated all sections', { ticker });
  // return generatedBlocks;
};
