export type PdfGenerationState = {
  isGenerating?: boolean;
  generate?: boolean;
};

export type PdfGenerationActions = {
  initGeneration: () => void;
  startGeneration: () => void;
  endGeneration: () => void;
};

// Does it work to set undefined like this?
export const createPdfGenerationSlice = (set: any, get: any) => ({
  isGenerating: false,
  generate: false,
  initGeneration: () => set({ generate: true }),
  startGeneration: () => set({ generate: false, isGenerating: true }),
  endGeneration: () => set({ isGenerating: false }),
});
