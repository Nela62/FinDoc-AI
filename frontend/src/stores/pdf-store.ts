import { Citation } from './citations-store';

export type PdfState = {
  documentId: string;
  pageNumber: number;
  citation?: Citation;
};

export type PdfActions = {
  setDocumentId: (documentId: string) => void;
  setPageNumber: (pageNumber: number) => void;
  setCitation: (citation: Citation) => void;
};

export const createPdfSlice = (set: any) => ({
  documentId: '',
  pageNumber: 1,
  citation: undefined,
  setDocumentId: (documentId: string) => set({ documentId }),
  setPageNumber: (pageNumber: number) => set({ pageNumber }),
  setCitation: (citation: Citation) => set({ citation }),
});
