'use client';

import { useBlockEditor } from '@/hooks/useBlockEditor';
import { EditableBlock } from '../editableBlock/EditableBlock';

import {
  EditorProvider,
  FloatingMenu,
  BubbleMenu,
  EditorContent,
  PureEditorContent,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useRef } from 'react';

export type EditablePageProps = {};

export type AiState = {
  isAiLoading: boolean;
  aiError?: string | null;
};

const extensions = [StarterKit];

const content = '<p>Hello World!</p>';

export const EditablePage = () => {
  const { editor, characterCount } = useBlockEditor();

  // const editorRef = useRef<PureEditorContent | null>(null);

  return (
    <div className="w-full h-full bg-white">
      {/* <EditableBlock /> */}
      {/* <FloatingMenu>This is the floating menu</FloatingMenu>
        <BubbleMenu>This is the bubble menu</BubbleMenu> */}
      <EditorContent
        editor={editor}
        // ref={editorRef}
        className="flex-1 overflow-y-auto bg-blue-300"
      />
    </div>
  );
};
