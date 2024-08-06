import { generateReportSections } from './generateReportSections';

export const generateReport = async (
  ticker: string,
  companyName: string,
  apiData: any,
  xmlData: string,
  newsContext: string,
  plan: string,
) => {
  try {
    const sections = await generateReportSections(
      ticker,
      companyName,
      apiData,
      xmlData,
      newsContext,
      plan,
    );
  } catch (err) {}
};
