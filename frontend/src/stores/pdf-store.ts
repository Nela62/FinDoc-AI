import { Citation } from './citations-store';

export type PdfState = {
  documentId?: string;
  pageNumber?: number;
  citation?: number;
};

export type PdfActions = {
  setDocumentId: (documentId: string) => void;
  setPageNumber: (pageNumber: number) => void;
  setCitation: (citation: number) => void;
  clearCitation: () => void;
  clearDocument: () => void;
};

// Does it work to set undefined like this?
export const createPdfSlice = (set: any, get: any) => ({
  documentId: undefined,
  pageNumber: undefined,
  citation: undefined,
  setDocumentId: (documentId: string) => set({ documentId }),
  setPageNumber: (pageNumber: number) => set({ pageNumber }),
  setCitation: (citation: number) => {
    get().setSelectedTab('Audit');
    set({
      citation: citation,
      documentId: get().citations.find(
        (c: Citation) => c.source_num === citation,
      )?.doc_id,
    });
  },
  clearDocument: () => set({ documentId: undefined }),
  clearCitation: () =>
    set({ citation: undefined, pageNumber: undefined, documentId: undefined }),
});
