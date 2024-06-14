import { TableRow } from 'docx';
import { headerBase } from './base';

export const sourcesHeader = async (
  authorCompanyLogo: Blob,
  companyTicker: string,
  createdAt: Date,
  primaryColor: string,
): Promise<TableRow[]> => {
  const base = await headerBase(
    primaryColor,
    companyTicker,
    'SOURCES',
    createdAt,
    true,
    authorCompanyLogo,
  );

  return [base];
};
