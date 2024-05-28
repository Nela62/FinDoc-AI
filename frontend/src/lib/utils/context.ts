import { IncomeStatement, Overview } from '@/types/alphaVantageApi';

function moneyFormat(labelValue: string | number) {
  // Nine Zeroes for Billions
  return Math.abs(Number(labelValue)) >= 1.0e9
    ? (Math.abs(Number(labelValue)) / 1.0e9).toFixed(2) + ' Billion'
    : // Six Zeroes for Millions
    Math.abs(Number(labelValue)) >= 1.0e6
    ? (Math.abs(Number(labelValue)) / 1.0e6).toFixed(2) + ' Million'
    : // Three Zeroes for Thousands
    Math.abs(Number(labelValue)) >= 1.0e3
    ? Math.abs(Number(labelValue)) / 1.0e3 + 'K'
    : Math.abs(Number(labelValue));
}

export const getBusinessDescriptionApiContext = (
  overview: Overview,
  incomeStatement: IncomeStatement,
) => {
  const context = `
  The description of the company is ${overview.Description} 
  Company's revenue on ${
    incomeStatement.annualReports[0].fiscalDateEnding
  } was ${moneyFormat(incomeStatement.annualReports[0].totalRevenue)}.
  Company's revenue on ${
    incomeStatement.annualReports[1].fiscalDateEnding
  } was ${moneyFormat(incomeStatement.annualReports[1].totalRevenue)}.
  `;
};
