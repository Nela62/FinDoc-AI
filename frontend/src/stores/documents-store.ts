import { Citation } from './citations-store';

export enum DocumentType {
  TenK = '10-K',
  TenQ = '10-Q',
  EarningsCalls = 'Earnings Calls',
  News = 'News',
}

export type Ticker = {
  company_ticker: string;
  company_name: string;
};

export interface SECDocument extends Ticker {
  id: string;
  url: string;
  year: number;
  doc_type: string;
  quarter?: string;
}

export interface NewsArticle {
  id: string;
  url: string;
  title: string;
  author?: string;
  text?: string;
  date: string;
}

export type Document = SECDocument;

export interface DocumentsState {
  documents: Document[];
  selectedDocument: Document | null;
}

export type DocumentsActions = {
  addDocuments: (documents: Document[]) => void;
  setDocuments: (documents: Document[]) => void;
};

export const createDocumentsSlice = (set: any) => ({
  documents: [],
  selectedDocument: null,
  addDocuments: (newDocuments: Document[]) =>
    set((state: any) => ({ documents: [...state.documents, ...newDocuments] })),
  setDocuments: (documents: Document[]) => set({ documents }),
});
