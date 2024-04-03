import { create } from 'zustand';

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
  EquityResearch = 'Equity Research',
  EarningsCallNote = 'Earnings Call Note',
  Other = 'Other',
}

export type Report = {
  id: string;
  title: string;
  companyTicker: string;
  type: ReportType;
  // dateCreated: Date;
  // lastUpdated: Date;
};

export interface ReportsState {
  reports: Report[];
  selectedReports: Report;
  addNewReport: (report: Report) => void;
  setSelectedReport: (report: Report) => void;
}

export const useReportsStateStore = create<ReportsState>((set) => ({
  reports: [
    {
      id: 'Dzd7LhprkD',
      title: 'Oct 23, 2023 - Equity Research Report',
      companyTicker: 'AAPL',
      type: ReportType.EquityResearch,
    },
    {
      id: 'r6BJzHbnCG',
      title: 'Q4 2023 - Earnings Call Note',
      companyTicker: 'AAPL',
      type: ReportType.EarningsCallNote,
    },
    {
      id: 'c6TWdN9N9k',
      title: 'Dec 14, 2023 - Equity Research Report',
      companyTicker: 'AMZN',
      type: ReportType.EquityResearch,
    },
  ],
  selectedReports: {
    id: 'Dzd7LhprkD',
    title: 'Oct 23, 2023 - Equity Research Report',
    companyTicker: 'AAPL',
    type: ReportType.EquityResearch,
  },
  addNewReport: (report: Report) =>
    set((state) => ({ reports: [...state.reports, report] })),
  setSelectedReport: (report: Report) => set({ selectedReports: report }),
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
