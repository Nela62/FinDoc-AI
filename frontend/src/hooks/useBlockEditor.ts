'use client';

import { Editor, useEditor, Node as Node, Content } from '@tiptap/react';

import { ExtensionKit } from '@/extensions/extension-kit';
import { useEffect } from 'react';
import { Citation } from '@/stores/citations-store';
import { useBoundStore } from '@/providers/store-provider';
import { SidebarTabs } from '@/stores/sidedbar-tabs-store';

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

export const useBlockEditor = () => {
  const {
    isEmpty,
    setIsEmpty,
    isAiLoading,
    setIsAiLoading,
    isAiInserting,
    setIsAiInserting,
    setAiError,
    setSelectedCitationSourceNum,
    reports,
    updateReport,
    setSelectedTab,
  } = useBoundStore((state) => state);
  // FIX: the reports don't update
  const editor = useEditor({
    autofocus: false,
    extensions: ExtensionKit(),
    editorProps: {
      handleClickOn: (view, pos, node) => {
        if (node.type.name === 'citation') {
          setSelectedCitationSourceNum(node.attrs.sourceNum);
          setSelectedTab('Citation');
        }
      },
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        class: 'min-h-full',
      },
    },
    // onCreate: ({ editor }) => {
    //   content && editor.commands.setContent(content);
    // },
    onUpdate({ editor }) {
      if (editor.isEmpty) {
        setIsEmpty(true);
      }

      // const saveContent = debounce(() => {
      //   const report = reports.find((r: Report) => r.id === reportId);

      //   if (!report) {
      //     return;
      //   }

      //   updateReport({
      //     ...report,
      //     content: editor.getJSON(),
      //   });
      // }, 1000);

      // saveContent();
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
