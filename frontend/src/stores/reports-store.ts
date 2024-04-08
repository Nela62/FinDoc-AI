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

// TODO: figure out how to deal with saving and loading content in demo, test, and prod env
export type Report = {
  id: string;
  title: string;
  companyTicker: string;
  type: ReportType;
  recommendation?: Recommendation;
  targetPrice?: string;
  content: Content;
  // dateCreated: Date;
  // lastUpdated: Date;
};

export type ReportsState = {
  reports: Report[];
  selectedReport: Report;
};

export type ReportsActions = {
  addNewReport: (report: Report) => void;
  setSelectedReport: (report: Report) => void;
  updateReport: (report: Report) => void;
};

const demoDefaultState = {
  reports: [
    {
      id: 'Dzd7LhprkD',
      title: 'Oct 23, 2023 - Equity Analyst Report',
      companyTicker: 'AAPL',
      type: ReportType.EquityAnalyst,
      content: '',
    },
    {
      id: 'r6BJzHbnCG',
      title: 'Q4 2023 - Earnings Call Note',
      companyTicker: 'AAPL',
      type: ReportType.EarningsCallNote,
      content: '',
    },
    {
      id: 'c6TWdN9N9k',
      title: 'Dec 14, 2023 - Equity Analyst Report',
      companyTicker: 'AMZN',
      type: ReportType.EquityAnalyst,
      content: initialContent,
    },
  ],
  selectedReport: {
    id: 'c6TWdN9N9k',
    title: 'Dec 14, 2023 - Equity Analyst Report',
    companyTicker: 'AMZN',
    type: ReportType.EquityAnalyst,
    content: initialContent,
  },
};

export const createReportsSlice = (set: any) => ({
  ...demoDefaultState,
  addNewReport: (report: Report) =>
    set((state: any) => ({ reports: [...state.reports, report] })),
  setSelectedReport: (report: Report) => set({ selectedReport: report }),
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
