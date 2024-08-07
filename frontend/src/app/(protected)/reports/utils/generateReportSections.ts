import { Logger } from 'next-axiom';
import { SubscriptionPlan } from '@/types/subscription';
import { createJob, waitForAllJobs } from './jobs';
import { Block } from './buildingBlocks';
import { ApiData } from './apiData';

export const section_ids = [
  'investment_thesis',
  'business_description',
  'recent_developments',
  'management',
  'risks',
  'financial_analysis',
  'valuation',
];

const log = new Logger();

export const generateReportSections = async (
  ticker: string,
  companyName: string,
  recommendation: string,
  targetPrice: string,
  apiData: ApiData,
  xmlData: string,
  newsContext: string,
  plan: string,
) => {
  console.log('creating jobs');
  const jobIds = await Promise.all(
    section_ids.map(async (id: string) => {
      const jobId = await createJob({
        blockId: id as Block,
        recommendation,
        targetPrice,
        plan: plan as SubscriptionPlan,
        companyName,
        apiData,
        xmlData: xmlData,
        newsData: newsContext,
        customPrompt: '',
      });
      return { blockId: id, id: jobId };
    }),
  );

  const generatedBlocks = await waitForAllJobs(jobIds);
  console.log('generatedBlocks', Object.keys(generatedBlocks));
  log.info('Generated all sections', { ticker });

  return generatedBlocks;
};
