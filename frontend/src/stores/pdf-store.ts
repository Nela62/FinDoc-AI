export type PdfState = {
  documentId?: string;
  pageNumber?: number;
  citationSnippetId?: string;
};

export type PdfActions = {
  setDocumentId: (documentId: string) => void;
  setPageNumber: (pageNumber: number) => void;
  setCitation: (citationSnippetId: string, doc_id: string) => void;
  clearCitation: () => void;
  clearDocument: () => void;
};

// Does it work to set undefined like this?
export const createPdfSlice = (set: any, get: any) => ({
  documentId: undefined,
  pageNumber: undefined,
  citationSnippetId: undefined,
  setDocumentId: (documentId: string) => set({ documentId }),
  setPageNumber: (pageNumber: number) => set({ pageNumber }),
  setCitation: (citationSnippetId: string, doc_id: string) => {
    get().setSelectedTab('Audit');
    set({
      citationSnippetId: citationSnippetId,
      documentId: doc_id,
    });
  },
  clearDocument: () => set({ documentId: undefined }),
  clearCitation: () =>
    set({
      citationSnippetId: undefined,
      pageNumber: undefined,
      documentId: undefined,
    }),
});
