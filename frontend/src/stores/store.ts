import { create } from 'zustand';
import { EditorActions, EditorState, createEditorSlice } from './editor-store';
import {
  SidebarActions,
  SidebarState,
  createSidebarSlice,
} from './sidebar-tabs-store';
import { PdfActions, PdfState, createPdfSlice } from './pdf-store';
import {
  ReportGenerationActions,
  ReportGenerationState,
  createReportGenerationSlice,
} from './report-generation-store';

export type Store = EditorState &
  EditorActions &
  SidebarState &
  SidebarActions &
  PdfState &
  PdfActions &
  ReportGenerationState &
  ReportGenerationActions;

export const createBoundStore = () => {
  return create<Store>((...a) => ({
    // @ts-ignore
    ...createEditorSlice(...a),
    // @ts-ignore
    ...createSidebarSlice(...a),
    // @ts-ignore
    ...createPdfSlice(...a),
    // @ts-ignore
    ...createReportGenerationSlice(...a),
  }));
};
