import { TableRow } from 'docx';
import { headerBase } from './base';

export const disclaimerHeader = async (
  authorCompanyLogo: Blob,
  companyTicker: string,
  createdAt: Date,
  primaryColor: string,
): Promise<TableRow[]> => {
  const base = await headerBase(
    primaryColor,
    companyTicker,
    'METHODOLOGY & DISCLAIMERS',
    createdAt,
    true,
    authorCompanyLogo,
  );

  return [base];
};
