export type EditorState = {
  isEmpty: boolean;
  isAiLoading: boolean;
  isAiInserting?: boolean;
  aiError?: string | null;
};

export type EditorActions = {
  setIsEmpty: (isEmpty: boolean) => void;
  setIsAiLoading: (isAiLoading: boolean) => void;
  setIsAiInserting: (isAiInserting: boolean) => void;
  setAiError: (aiError: string | null) => void;
};

export const defaultEditorState = {
  isEmpty: true,
  isAiLoading: false,
  isAiInserting: false,
  aiError: null,
};

export const createEditorSlice = (set: any) => ({
  ...defaultEditorState,
  setIsEmpty: (isEmpty: boolean) => set({ isEmpty }),
  setIsAiLoading: (isAiLoading: boolean) => set({ isAiLoading }),
  setIsAiInserting: (isAiInserting: boolean) => set({ isAiInserting }),
  setAiError: (aiError: string | null) => set({ aiError }),
});

// import { createStore } from 'zustand/vanilla';

// export const useEditorStateSlice = (
//   initState: EditorState = defaultEditorState,
// ) => {
//   return createStore<EditorState>((set) => ({
//     ...initState,
//     setIsEmpty: (isEmpty: boolean) => set({ isEmpty }),
//     setIsAiLoading: (isAiLoading: boolean) => set({ isAiLoading }),
//     setIsAiInserting: (isAiInserting: boolean) => set({ isAiInserting }),
//     setAiError: (aiError: string | null) => set({ aiError }),
//   }));
// };
