import { initialContent } from '@/lib/data/initialContent';
import { Content } from '@tiptap/core';

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

// TODO: figure out how to deal with saving and loading content in demo, test, and prod env
export type Report = {
  id: string;
  title: string;
  companyTicker: string;
  type: ReportType;
  recommendation?: Recommendation;
  targetPrice?: string;
  content: Content;
  status: ReportStatus;
  createdAt: Date;
  lastUpdated: Date;
};

export type ReportsState = {
  reports: Report[];
};

export type ReportsActions = {
  setReports: (reports: Report[]) => void;
  addNewReport: (report: Report) => void;
  addReports: (reports: Report[]) => void;
  updateReport: (report: Report) => void;
};

export const demoReports: Report[] = [
  {
    id: 'Dzd7LhprkD',
    title: 'Oct 23, 2023 - Equity Analyst Report',
    companyTicker: 'AAPL',
    type: ReportType.EquityAnalyst,
    status: ReportStatus.Draft,
    createdAt: new Date('2023-10-14'),
    lastUpdated: new Date('2023-10-23'),
    content: '',
  },
  {
    id: 'r6BJzHbnCG',
    title: 'Q4 2023 - Earnings Call Note',
    companyTicker: 'AAPL',
    type: ReportType.EarningsCallNote,
    status: ReportStatus.Draft,
    createdAt: new Date('2023-10-23'),
    lastUpdated: new Date('2023-12-18'),
    content: '',
  },
  {
    id: 'c6TWdN9N9k',
    title: 'Dec 14, 2023 - Equity Analyst Report',
    companyTicker: 'AMZN',
    type: ReportType.EquityAnalyst,
    status: ReportStatus.InReview,
    createdAt: new Date('2023-12-14'),
    lastUpdated: new Date('2023-12-14'),
    content: initialContent,
  },
];

export const createReportsSlice = (set: any) => ({
  reports: [],
  setReports: (reports: Report[]) => set({ reports }),
  addNewReport: (report: Report) =>
    set((state: any) => ({ reports: [...state.reports, report] })),
  addReports: (reports: Report[]) => set({ reports }),
  // TODO: there must be a better way to update a report
  updateReport: (report: Report) =>
    set((state: any) => ({
      reports: [
        ...state.reports.slice(
          0,
          state.reports.findIndex((r: Report) => r.id === report.id),
        ),
        { ...report },
        ...(state.reports.slice(
          state.reports.findIndex((r: Report) => r.id === report.id) + 1,
        ) ?? null),
      ],
    })),
});
