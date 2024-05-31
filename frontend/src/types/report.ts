import { Content } from '@tiptap/react';

export type Recommendation =
  | 'Buy'
  | 'Overweight'
  | 'Hold'
  | 'Underweight'
  | 'Sell';

export type FinancialStrength =
  | 'Low'
  | 'Low-Medium'
  | 'Medium'
  | 'Medium-High'
  | 'High';
// TODO: add financial strength type

export type ReportStatus = 'Draft' | 'In Review' | 'Approved' | 'Published';

type EquityAnalystReport = {
  type: 'Equity Analyst Report';
  recommendation: Recommendation;
  targetPrice: number;
  financialStrength: FinancialStrength;
};

type EarningsCallNote = {
  type: 'Earnings Call Note';
};

export type Report = {
  id: string;
  url: string;
  title: string;
  companyTicker: string;
  companyName: string;
  htmlContent: Content;
  jsonContent: Content;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
} & (EquityAnalystReport | EarningsCallNote);
