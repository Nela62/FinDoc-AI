export type Citation = {
  node_id: string;
  text: string;
  source_num: number;
  page: number;
  url: string;
  doc_type: string;
  company_name: string;
  company_ticker: string;
  year: number;
  quarter: string | null;
};

export type CitationsState = {
  citations: Citation[];
  selectedCitation: Citation | null;
};

export type CitationsActions = {
  addCitations: (citations: Citation[]) => void;
  setSelectedCitation: (citationSourceNum: number) => void;
};

// TODO: accept and pass initial state

export const createCitationsSlice = (set: any) => ({
  selectedCitation: null,
  citations: [],
  addCitations: (newCitations: Citation[]) =>
    set((state: any) => ({ citations: [...state.citations, ...newCitations] })),
  setSelectedCitation: (citationSourceNum: number) =>
    set((state: any) => ({
      selectedCitation: state.citations.find(
        (c: Citation) => c.source_num === citationSourceNum,
      ),
    })),
});
