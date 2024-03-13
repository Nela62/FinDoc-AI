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

export type Document = {
  id: string;
  title: string;
};

export interface DocumentState {
  documents: Document[];
  selectedDocument: Document;
  addNewDocument: (document: Document) => void;
  setSelectedDocument: (document: Document) => void;
}

export const useDocumentStateStore = create<DocumentState>((set) => ({
  documents: [
    { id: 'Dzd7LhprkD', title: 'Apple' },
    { id: 'c6TWdN9N9k', title: 'Amazon' },
  ],
  selectedDocument: { id: 'Dzd7LhprkD', title: 'Apple' },
  addNewDocument: (document: Document) =>
    set((state) => ({ documents: [...state.documents, document] })),
  setSelectedDocument: (document: Document) =>
    set({ selectedDocument: document }),
}));
