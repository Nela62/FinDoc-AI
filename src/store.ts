import { create } from 'zustand';

export interface AiState {
  isAiLoading: boolean;
  aiError?: string | null;
  setIsAiLoading: (isAiLoading: boolean) => void;
  setAiError: (aiError: string | null) => void;
}

export const useAiStateStore = create<AiState>((set) => ({
  isAiLoading: false,
  aiError: null,
  setIsAiLoading: (isAiLoading: boolean) => set({ isAiLoading }),
  setAiError: (aiError: string | null) => set({ aiError }),
}));
