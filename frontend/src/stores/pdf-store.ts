import { clear } from 'console';

export type PdfState = {
  documentId: string;
  pageNumber: number;
  citation?: number;
};

export type PdfActions = {
  setDocumentId: (documentId: string) => void;
  setPageNumber: (pageNumber: number) => void;
  setCitation: (citation: number) => void;
  clearCitation: () => void;
};

// Does it work to set undefined like this?
export const createPdfSlice = (set: any, get: any) => ({
  documentId: '',
  pageNumber: 1,
  citation: undefined,
  setDocumentId: (documentId: string) => set({ documentId }),
  setPageNumber: (pageNumber: number) => set({ pageNumber }),
  setCitation: (citation: number) => {
    get().setSelectedTab('Audit');
    set({ citation });
  },
  clearCitation: () => set({ citation: undefined }),
});
