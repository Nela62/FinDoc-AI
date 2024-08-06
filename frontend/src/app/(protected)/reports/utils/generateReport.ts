'use server';
import { JSONContent } from '@tiptap/core';
import { generateReportSections, section_ids } from './generateReportSections';
import { Logger } from 'next-axiom';
import { markdownToJson } from '@/lib/utils/formatText';
import { createJob, waitForJobCompletion } from './jobs';
import { SubscriptionPlan } from '@/types/subscription';
import { createClient } from '@/lib/supabase/server';
import { ApiData } from './apiData';

const titles = {
  investment_thesis: 'Investment Thesis',
  business_description: 'Business Description',
  recent_developments: 'Recent Developments',
  industry_overview_competitive_positioning:
    'Industry Overview and Competitive Positioning',
  financial_analysis: 'Financial Analysis',
  valuation: 'Valuation',
  management: 'Management Analysis',
  risks: 'Risk Analysis',
};

const log = new Logger();

export type GenerateReportArgs = {
  reportId: string;
  templateId: string;
  recommendation: string;
  targetPrice: string;
  ticker: string;
  companyName: string;
  apiData: ApiData;
  xmlData: string;
  newsContext: string;
  plan: SubscriptionPlan;
};

export const generateReport = async ({
  reportId,
  templateId,
  recommendation,
  targetPrice,
  ticker,
  companyName,
  apiData,
  xmlData,
  newsContext,
  plan,
}: GenerateReportArgs) => {
  'use server';

  try {
    const supabase = createClient();

    const generatedBlocks = await generateReportSections(
      ticker,
      companyName,
      recommendation,
      targetPrice,
      apiData,
      xmlData,
      newsContext,
      plan,
    );

    const generatedJson: JSONContent = { type: 'doc', content: [] };
    let generatedContent = '';

    log.info('Generated all sections', { ticker });

    section_ids.forEach((id) => {
      if (!generatedBlocks[id]) return;
      generatedContent += `##${titles[id as keyof typeof titles]}\
    ${generatedBlocks[id]}`;

      const json = markdownToJson(generatedBlocks[id]);
      generatedJson.content?.push(
        {
          type: 'heading',
          attrs: {
            id: '220f43a9-c842-4178-b5b4-5ed8a33c6192',
            level: 2,
            'data-toc-id': '220f43a9-c842-4178-b5b4-5ed8a33c6192',
          },
          content: [
            {
              text: titles[id as keyof typeof titles],
              type: 'text',
            },
          ],
        },
        ...json.content,
      );
    });

    // generate a summary if required
    const summaryJobId = await createJob({
      blockId: 'executive_summary',
      generatedReport: generatedContent,
      plan: plan,
    });

    const summaryRes = await waitForJobCompletion(summaryJobId);
    const summary = summaryRes.includes('•')
      ? summaryRes
          .split('• ')
          .map((point: string) => point.trim())
          ?.slice(1)
      : summaryRes
          .split('- ')
          .map((point: string) => point.trim())
          ?.slice(1);

    log.info('Generated the summary of a report', {
      ticker,
      summary: summary,
      summaryRes: summaryRes,
    });

    if (summary === '') {
      log.error('Summary is empty', {
        ticker,
        summary: summary,
        summaryRes: summaryRes,
      });
    }
    // update report and template
    await supabase
      .from('reports')
      .update({
        tiptap_content: generatedJson,
        json_content: generatedBlocks,
      })
      .eq('id', reportId);

    await supabase
      .from('report_template')
      .update({
        summary: summary,
      })
      .eq('id', templateId);
  } catch (err) {
    // console.error(err.message);
    err instanceof Error &&
      log.error('Error generating report', {
        ticker,
        ...err,
      });
  }
};
