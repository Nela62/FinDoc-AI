import { Content } from '@tiptap/core';
import { create } from 'zustand';
import { initialContent } from './lib/data/initialContent';

export interface EditorState {
  isEmpty: boolean;
  isAiLoading: boolean;
  isAiInserting?: boolean;
  aiError?: string | null;
  setIsEmpty: (isEmpty: boolean) => void;
  setIsAiLoading: (isAiLoading: boolean) => void;
  setIsAiInserting: (isAiInserting: boolean) => void;
  setAiError: (aiError: string | null) => void;
}

export const useEditorStateStore = create<EditorState>((set) => ({
  isEmpty: true,
  isAiLoading: false,
  isAiInserting: false,
  aiError: null,
  setIsEmpty: (isEmpty: boolean) => set({ isEmpty }),
  setIsAiLoading: (isAiLoading: boolean) => set({ isAiLoading }),
  setIsAiInserting: (isAiInserting: boolean) => set({ isAiInserting }),
  setAiError: (aiError: string | null) => set({ aiError }),
}));

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

export type Report = {
  id: string;
  title: string;
  companyTicker: string;
  type: ReportType;
  recommendation?: Recommendation;
  targetPrice?: string;
  // dateCreated: Date;
  // lastUpdated: Date;
};

export interface ReportsState {
  reports: Report[];
  selectedReport: Report;
  addNewReport: (report: Report) => void;
  setSelectedReport: (report: Report) => void;
  updateReport: (report: Report) => void;
}

export const useReportsStateStore = create<ReportsState>((set) => ({
  reports: [
    {
      id: 'Dzd7LhprkD',
      title: 'Oct 23, 2023 - Equity Analyst Report',
      companyTicker: 'AAPL',
      type: ReportType.EquityAnalyst,
    },
    {
      id: 'r6BJzHbnCG',
      title: 'Q4 2023 - Earnings Call Note',
      companyTicker: 'AAPL',
      type: ReportType.EarningsCallNote,
    },
    {
      id: 'c6TWdN9N9k',
      title: 'Dec 14, 2023 - Equity Analyst Report',
      companyTicker: 'AMZN',
      type: ReportType.EquityAnalyst,
    },
  ],
  selectedReport: {
    id: 'Dzd7LhprkD',
    title: 'Oct 23, 2023 - Equity Research Report',
    companyTicker: 'AAPL',
    type: ReportType.EquityAnalyst,
  },
  addNewReport: (report: Report) =>
    set((state) => ({ reports: [...state.reports, report] })),
  setSelectedReport: (report: Report) => set({ selectedReport: report }),
  // TODO: not sure if this will fully work
  updateReport: (report: Report) =>
    set((state) => ({
      reports: [
        ...state.reports.slice(
          0,
          state.reports.findIndex((r) => r.id === report.id),
        ),
        { ...report },
        ...(state.reports.slice(
          state.reports.findIndex((r) => r.id === report.id) + 1,
        ) ?? null),
      ],
    })),
}));

export type Citation = {
  node_id: string;
  text: string;
  source_num: number;
};

export interface CitationsState {
  citations: Citation[];
  addCitations: (citations: Citation[]) => void;
}

export const useCitationsStateStore = create<CitationsState>((set) => ({
  citations: [],
  addCitations: (citations: Citation[]) => {
    set((state) => ({ citations: [...state.citations, ...citations] }));
  },
}));

export type ReportContent = {
  reportId: string;
  // htmlContent: Content;
  jsonContent: Content;
};

export interface DemoState {
  reportContent: ReportContent[];
  addReportContent: (reportContent: ReportContent) => void;
  editReportContent: (reportContent: ReportContent) => void;
}

export const useDemoStateStore = create<DemoState>((set) => ({
  reportContent: [
    {
      reportId: 'Dzd7LhprkD',
      // htmlContent: '',
      jsonContent: '',
    },
    {
      reportId: 'r6BJzHbnCG',
      // htmlContent: '',
      jsonContent: '',
    },
    {
      reportId: 'c6TWdN9N9k',
      // htmlContent: '',
      jsonContent: initialContent,
    },
  ],
  addReportContent: (reportContent: ReportContent) => {
    set((state) => ({
      reportContent: [...state.reportContent, reportContent],
    }));
  },
  editReportContent: (reportContent: ReportContent) => {
    set((state) => ({
      reportContent: state.reportContent.map((rc) =>
        rc.reportId === reportContent.reportId ? reportContent : rc,
      ),
    }));
  },
}));
