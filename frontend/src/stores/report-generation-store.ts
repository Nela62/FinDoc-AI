export type ReportGenerationState = {
  sectionsGenerated: number;
  totalSections: number;
  firstStageStarted: boolean;
  firstStageCompleted: boolean;
  chartStageStarted: boolean;
  chartStageCompleted: boolean;
  progress: number;
  message: string;
};

export type ReportGenerationActions = {
  resetState: () => void;
  startGeneration: (totalSections: number) => void;
  increaseSectionsGenerated: () => void;
  completeChartStage: () => void;
};

export const defaultReportGenerationState = {
  sectionsGenerated: 0,
  totalSections: 0,
  firstStageStarted: false,
  firstStageCompleted: false,
  chartStageStarted: false,
  chartStageCompleted: false,
  progress: 0,
  message: '',
};

const progressMessages = [
  'Retrieving context from SEC filings...',
  'Fetching data from financial APIs...',
  'Searching the web for financial news...',
  'Generating charts and tables...',
];

export const createReportGenerationSlice = (set: any, get: any) => ({
  ...defaultReportGenerationState,
  startGeneration: (totalSections: number) => {
    set({
      message: progressMessages[0],
      firstStageStarted: true,
      totalSections: totalSections,
    });

    setTimeout(() => {
      set({ progress: 20, message: progressMessages[1] });
    }, 2000);

    setTimeout(() => {
      set({ progress: 40, message: progressMessages[2] });
    }, 3000);

    setTimeout(() => {
      set((state: any) => ({
        progress: 60,
        message: `Generating sections (${state.sectionsGenerated} out of ${state.totalSections} done)...`,
        firstStageCompleted: true,
      }));
    }, 4000);
  },
  increaseSectionsGenerated: () => {
    if (!get().firstStageStarted) {
      return;
    } else if (!get().firstStageCompleted) {
      set((state: any) => ({ sectionsGenerated: state.sectionsGenerated + 1 }));
    } else if (get().sectionsGenerated < get().totalSections) {
      set((state: any) => ({
        sectionsGenerated: state.sectionsGenerated + 1,
        message: `Generating sections (${state.sectionsGenerated + 1} out of ${
          state.totalSections
        } done)...`,
        progress:
          60 + ((state.sectionsGenerated + 1) / state.totalSections) * 20,
      }));
    } else {
      set((state: any) => ({
        sectionsGenerated: state.sectionsGenerated + 1,
        message: progressMessages[3],
        progress: 80,
        chartStageStarted: true,
      }));
    }
  },
  completeChartStage: () => {
    set({ message: '', progress: 100, chartStageCompleted: true });
  },
  resetState: () => {
    set({ defaultReportGenerationState });
  },
});
