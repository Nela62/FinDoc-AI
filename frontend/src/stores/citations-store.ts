export type Citation = {
  node_id: string;
  text: string;
  source_num: number;
  page: number;
  doc_id: string;
  // status: 'Approved' | 'Rejected' | 'Pending'
};

// this store is only used for the demo purposes
// in all other cases, the citations are updated and cached
// using react query

export type CitationsState = {
  citations: Citation[];
};

export type CitationsActions = {
  addCitations: (citations: Citation[]) => void;
};

export const createCitationsSlice = (set: any) => ({
  citations: [],
  addCitations: (newCitations: Citation[]) =>
    set((state: any) => ({ citations: [...state.citations, ...newCitations] })),
});
