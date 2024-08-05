import { z } from 'zod';
import { reportFormSchema, TickerData } from '../ReportForm';
import { getNanoId } from '@/lib/utils/nanoId';
import { format } from 'date-fns';
import { section_ids } from './generateReportSections';

export async function createNewReport(
  values: z.infer<typeof reportFormSchema>,
  userId: string,
  insertNewReport: any,
): Promise<string> {
  const nanoId = getNanoId();
  const res = await insertNewReport([
    {
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
    },
  ]);

  if (!res) {
    throw new Error('An exception occurred when creating a new report.');
  }

  return res[0].id;
}

export function getTickerData(ticker: string, tickersData: any[]): TickerData {
  const tickerData = tickersData?.find((company) => company.ticker === ticker);
  if (!tickerData) {
    throw new Error(`Company name for ticker ${ticker} was not found.`);
  }
  return tickerData;
}
