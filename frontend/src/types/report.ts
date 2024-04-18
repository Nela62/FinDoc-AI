import { Content } from '@tiptap/react';

export enum ReportType {
  EquityAnalyst = 'Equity Analyst Report',
  EarningsCallNote = 'Earnings Call Note',
  Other = 'Other',
}

export enum Recommendation {
  Auto = 'Auto',
  Buy = 'Buy',
  Hold = 'Hold',
  Sell = 'Sell',
  Overweight = 'Overweight',
  Underweight = 'Underweight',
}

export enum ReportStatus {
  Draft = 'Draft',
  InReview = 'In Review',
  Approved = 'Approved',
  Published = 'Published',
}

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
