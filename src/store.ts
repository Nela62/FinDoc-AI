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
  id: string;
  title: string;
  setId: (id: string) => void;
  setTitle: (title: string) => void;
}

export const useDocumentStateStore = create<DocumentState>((set) => ({
  documents: [
    { id: '1', title: 'Apple' },
    { id: '2', title: 'Amazon' },
  ],
  id: '1',
  title: 'Apple',
  setId: (id: string) => set({ id }),
  setTitle: (title: string) => set({ title }),
}));
