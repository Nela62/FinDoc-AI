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
import { createSidebarSlice } from './sidedbar-tabs-store';

export type Store = EditorState &
  EditorActions &
  ReportsState &
  ReportsActions &
  CitationsState &
  CitationsActions;

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
  }));
};
