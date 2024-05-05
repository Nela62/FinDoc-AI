'use client';

import { Content, Editor, useEditor } from '@tiptap/react';

import { ExtensionKit } from '@/extensions/extension-kit';
import { useEffect } from 'react';
import { useBoundStore } from '@/providers/store-provider';
import {
  useQuery,
  useUpdateMutation,
} from '@supabase-cache-helpers/postgrest-react-query';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { fetchReportById } from '@/lib/queries';

const debounce = require('lodash.debounce');

declare global {
  interface Window {
    editor: Editor | null;
  }
}

const getAiCompletion = async () => {
  const response = await fetch('http://127.0.0.1:3000/api/completion', {
    method: 'GET',
  });

  return response.json();
};

export const useBlockEditor = (reportId: string, content: Content) => {
  const {
    isEmpty,
    setIsEmpty,
    isAiLoading,
    setIsAiLoading,
    isAiInserting,
    setIsAiInserting,
    setAiError,
    setCitation,
    setSelectedTab,
  } = useBoundStore((state) => state);

  const supabase = createClient();

  // const { data: citations } = useQuery(fetchCitations(supabase, reportId));

  const { mutateAsync: update } = useUpdateMutation(
    supabase.from('reports'),
    ['id'],
    null,
  );

  // FIX: the reports don't update
  const editor = useEditor({
    autofocus: false,
    extensions: ExtensionKit(),
    editorProps: {
      handleClickOn: (view, pos, node) => {
        if (node.type.name === 'citation') {
          // const doc_id = citations?.find(
          //   (c) => c.source_num === node.attrs.sourceNum,
          // )?.doc_id;
          // console.log(doc_id);
          // if (!doc_id) return;
          // setCitation(node.attrs.sourceNum, doc_id);
        }
      },
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        class: 'min-h-full',
      },
    },
    onCreate: ({ editor }) => {
      content && editor.commands.setContent(content);
    },

    onUpdate({ editor }) {
      if (editor.isEmpty) {
        setIsEmpty(true);
      }
      // TODO: update citations and sources
      const saveContent = debounce(() => {
        update({
          id: reportId,
          html_content: editor.getHTML(),
          json_content: editor.getJSON(),
        });
      }, 2000);

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
