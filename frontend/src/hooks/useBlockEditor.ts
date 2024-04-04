'use client';

import { Editor, useEditor } from '@tiptap/react';

import { useDemoStateStore, useEditorStateStore } from '@/store';
import { ExtensionKit } from '@/extensions/extension-kit';
import { useEffect } from 'react';

const debounce = require('lodash.debounce');

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

export const useBlockEditor = (reportId: string) => {
  const isEmpty = useEditorStateStore((state) => state.isEmpty);
  const setIsEmpty = useEditorStateStore((state) => state.setIsEmpty);
  const setIsAiLoading = useEditorStateStore((state) => state.setIsAiLoading);
  const isAiInserting = useEditorStateStore((state) => state.isAiInserting);
  const setAiError = useEditorStateStore((state) => state.setAiError);
  const setIsAiInserting = useEditorStateStore(
    (state) => state.setIsAiInserting,
  );
  const reportContent = useDemoStateStore((state) => state.reportContent);
  const editReportContent = useDemoStateStore(
    (state) => state.editReportContent,
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
    // TODO: remove this once dev is done
    onCreate: ({ editor }) => {
      if (editor.isEmpty) {
        // editor.commands.setContent(initialContent);
      }
      editor.commands.setContent(
        reportContent.find((r) => r.reportId === reportId)?.jsonContent || '',
      );
    },
    onUpdate({ editor }) {
      if (editor.isEmpty) {
        setIsEmpty(true);
      }

      const saveContent = debounce(() => {
        editReportContent({
          reportId: reportId,
          jsonContent: editor.getJSON(),
          // htmlContent: editor.getHTML(),
        });
      }, 1000);

      saveContent();
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

  return { editor, characterCount, isEmpty };
};
