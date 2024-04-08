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

export type Store = EditorState &
  EditorActions &
  ReportsState &
  ReportsActions &
  CitationsState &
  CitationsActions;

// export const useBoundStore =
// create<Store>((...a) => ({
//   // @ts-ignore
//   ...createCitationsSlice(...a),
//   // @ts-ignore
//   ...createReportsSlice(...a),
//   // @ts-ignore
//   ...createEditorSlice(...a),
// }));

export const createBoundStore = () => {
  return create<Store>((...a) => ({
    // @ts-ignore
    ...createCitationsSlice(...a),
    // @ts-ignore
    ...createReportsSlice(...a),
    // @ts-ignore
    ...createEditorSlice(...a),
  }));
};
