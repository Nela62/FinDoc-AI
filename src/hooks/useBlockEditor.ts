'use client';

import { Editor, Extension, useEditor } from '@tiptap/react';

import { useAiStateStore } from '@/store';
import { ExtensionKit } from '@/extensions/extension-kit';
import { useEffect } from 'react';

import { initialContent } from '@/lib/data/initialContent';

declare global {
  interface Window {
    editor: Editor | null;
  }
}

export const useBlockEditor = () => {
  const setIsAiLoading = useAiStateStore((state) => state.setIsAiLoading);
  const setAiError = useAiStateStore((state) => state.setAiError);

  const editor = useEditor({
    autofocus: true,
    extensions: ExtensionKit(),
    content: initialContent,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        class: 'min-h-full',
      },
    },
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
