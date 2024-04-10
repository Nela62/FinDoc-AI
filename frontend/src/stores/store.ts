import { create } from 'zustand';
import {
  ReportsActions,
  ReportsState,
  createReportsSlice,
} from './reports-store';
import {
  CitationsActions,
  CitationsState,
  createCitationsSlice,
} from './citations-store';
import { EditorActions, EditorState, createEditorSlice } from './editor-store';
import {
  SidebarActions,
  SidebarState,
  createSidebarSlice,
} from './sidedbar-tabs-store';
import { PdfActions, PdfState, createPdfSlice } from './pdf-store';
import {
  DocumentsActions,
  DocumentsState,
  createDocumentsSlice,
} from './documents-store';

export type Store = EditorState &
  EditorActions &
  ReportsState &
  ReportsActions &
  CitationsState &
  CitationsActions &
  SidebarState &
  SidebarActions &
  PdfState &
  PdfActions &
  DocumentsState &
  DocumentsActions;

export const createBoundStore = () => {
  return create<Store>((...a) => ({
    // @ts-ignore
    ...createCitationsSlice(...a),
    // @ts-ignore
    ...createReportsSlice(...a),
    // @ts-ignore
    ...createEditorSlice(...a),
    // @ts-ignore
    ...createSidebarSlice(...a),
    // @ts-ignore
    ...createPdfSlice(...a),
    // @ts-ignore
    ...createDocumentsSlice(...a),
  }));
};
