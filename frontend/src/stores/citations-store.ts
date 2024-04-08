export type Citation = {
  node_id: string;
  text: string;
  source_num: number;
};

export type CitationsState = {
  isUpdated: boolean;
  citations: Citation[];
};

export type CitationsActions = {
  addCitations: (citations: Citation[]) => void;
  setUpdated: (updated: boolean) => void;
};

// TODO: accept and pass initial state

export const createCitationsSlice = (set: any) => ({
  isUpdated: false,
  citations: [],
  setUpdated: (updated: boolean) => set({ isUpdated: updated }),
  addCitations: (newCitations: Citation[]) =>
    set((state: any) => ({ citations: [...state.citations, ...newCitations] })),
});
