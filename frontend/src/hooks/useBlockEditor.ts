'use client';

import { Editor, useEditor } from '@tiptap/react';

import { ExtensionKit } from '@/extensions/extension-kit';
import { useEffect } from 'react';
import { useBoundStore } from '@/stores/store';
import { Citation } from '@/stores/citations-store';
import { Report } from '@/stores/reports-store';

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
  const {
    isEmpty,
    setIsEmpty,
    isAiLoading,
    setIsAiLoading,
    isAiInserting,
    setIsAiInserting,
    setAiError,
    citations,
    reports,
    updateReport,
  } = useBoundStore((state) => state);

  const editor = useEditor({
    autofocus: false,
    extensions: ExtensionKit(),
    editorProps: {
      handleClickOn: (view, pos, node) => {
        if (node.type.name === 'citation') {
          console.log(citations);
          alert(`clicked on citation ${node.attrs.sourceNum}`);
          console.log(
            citations.find(
              (c: Citation) => c.source_num === node.attrs.sourceNum,
            ),
          );
        }
      },
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
        reports.find((r: Report) => r.id === reportId)?.content || '',
      );
    },
    onUpdate({ editor }) {
      if (editor.isEmpty) {
        setIsEmpty(true);
      }

      const saveContent = debounce(() => {
        const report = reports.find((r: Report) => r.id === reportId);

        if (!report) {
          return;
        }

        updateReport({
          ...report,
          content: editor.getJSON(),
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
