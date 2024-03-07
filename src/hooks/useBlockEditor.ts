'use client';

import { Editor, Extension, useEditor } from '@tiptap/react';

import { useEditorStateStore } from '@/store';
import { ExtensionKit } from '@/extensions/extension-kit';
import { useEffect } from 'react';

import { initialContent } from '@/lib/data/initialContent';

declare global {
  interface Window {
    editor: Editor | null;
  }
}

const getAiCompletion = async () => {
  const response = await fetch('http://localhost:3000/api/completion', {
    method: 'GET',
  });

  return response.json();
};

export const useBlockEditor = () => {
  const isEmpty = useEditorStateStore((state) => state.isEmpty);
  const setIsEmpty = useEditorStateStore((state) => state.setIsEmpty);
  const setIsAiLoading = useEditorStateStore((state) => state.setIsAiLoading);
  const isAiInserting = useEditorStateStore((state) => state.isAiInserting);
  const setAiError = useEditorStateStore((state) => state.setAiError);
  const setIsAiInserting = useEditorStateStore(
    (state) => state.setIsAiInserting,
  );

  const editor = useEditor({
    autofocus: true,
    extensions: ExtensionKit(),
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        class: 'min-h-full',
      },
    },
    // onCreate: ({ editor }) => {
    //   if (editor.isEmpty) {
    //     editor.commands.setContent('<p>Start writing...</p>');
    //   }
    // },
    onUpdate({ editor }) {
      if (editor.isEmpty) {
        setIsEmpty(true);
      }
    },
    // onTransaction({ editor }) {
    //   if (isAiInserting) {
    //     return;
    //   }
    //   const cursor = editor.state.selection.$anchor.pos;

    //   // editor.commands.insertContentAt(cursor, 'Hello from AI', {
    //   //   updateSelection: false,
    //   // });
    // },
  });

  const characterCount = editor?.storage.characterCount || {
    characters: () => 0,
    words: () => 0,
  };

  useEffect(() => {
    window.editor = editor;
  }, [editor]);

  return { editor, characterCount };
};
