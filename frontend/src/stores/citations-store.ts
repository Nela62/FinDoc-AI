export type Citation = {
  node_id: string;
  text: string;
  source_num: number;
  page: number;
  doc_id: string;
  // status: 'Approved' | 'Rejected' | 'Pending'
};

export type CitationsState = {
  citations: Citation[];
  selectedCitationSourceNum: number | null;
};

export type CitationsActions = {
  addCitations: (citations: Citation[]) => void;
  setSelectedCitationSourceNum: (citationSourceNum: number | null) => void;
};

// TODO: accept and pass initial state

export const createCitationsSlice = (set: any) => ({
  selectedCitationSourceNum: null,
  citations: [],
  addCitations: (newCitations: Citation[]) =>
    set((state: any) => ({ citations: [...state.citations, ...newCitations] })),
  setSelectedCitationSourceNum: (citationSourceNum: number | null) =>
    set((state: any) => ({
      selectedCitationSourceNum: citationSourceNum,
    })),
});
