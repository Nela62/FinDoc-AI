import { Content } from '@tiptap/react';

export type ReportType =
  | 'Equity Analyst Report'
  | 'Earnings Call Note'
  | 'Other';

export type Recommendation =
  | 'Auto'
  | 'Buy'
  | 'Hold'
  | 'Sell'
  | 'Overweight'
  | 'Underweight';

export type ReportStatus = 'Draft' | 'In Review' | 'Approved' | 'Published';

export type Report = {
  id: string;
  url: string;
  title: string;
  company_ticker: string;
  type: ReportType;
  recommendation?: Recommendation;
  targetPrice?: string;
  html_content: Content;
  json_content: Content;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
};
