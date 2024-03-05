'use client';

import { Editor, Extension, useEditor } from '@tiptap/react';

import { useAiStateStore } from '@/store';
import { ExtensionKit } from '@/extensions/extension-kit';
import { useEffect } from 'react';

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
    content: `
        <p>Try to drag around the image. While you drag, the editor should show a decoration under your cursor. The so called dropcursor.</p>
        <img src="https://source.unsplash.com/8xznAGy4HcY/800x400" />
      `,
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
