'use client';

import { Sidebar } from '@/components/SideBar';
import { ContentItemMenu, LinkMenu, TextMenu } from '@/components/menus';
import ImageBlockMenu from '@/extensions/ImageBlock/components/ImageBlockMenu';
import { ColumnsMenu } from '@/extensions/MultiColumn/menus';
import { TableColumnMenu, TableRowMenu } from '@/extensions/Table/menus';
import { useBlockEditor } from '@/hooks/useBlockEditor';
import { Editor, EditorContent } from '@tiptap/react';
import { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

import '@/styles/index.css';
import { AiChat } from '@/components/chat';
import { useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { Combobox } from '@/components/ui/Combobox';
import { tickers } from '@/lib/data/tickers';
import { getPrompts } from './prompts';
export type AiState = {
  isAiLoading: boolean;
  aiError?: string | null;
};

const generateReport = async (ticker: string, editor: Editor) => {
  const company = tickers.find((t) => t.value === ticker)?.label;

  if (!company) {
    return;
  }

  editor.commands.insertContent('<h1>' + company + '</h1>');

  const prompts = getPrompts(company);

  for (let i = 0; i < prompts.length; i++) {
    const res = await fetch('/api/generation', {
      method: 'POST',
      body: JSON.stringify({
        company,
        prompt: prompts[i].prompt,
      }),
    });
    const body = await res.json();
    editor.commands.insertContent('<h2>' + prompts[i].section + '</h2>');
    editor.commands.insertContent(
      '<p>' + body.response.replace(/\n/g, '') + '</p>',
    );
  }
};

export default function Document({ params }: { params: { document: string } }) {
  const { document: documentId } = params;
  const isNew = useSearchParams().get('isNew') === 'true';

  // TODO: Fetch document

  const { editor, characterCount } = useBlockEditor();
  const menuContainerRef = useRef(null);

  const [value, setValue] = useState('');

  if (!editor) {
    return null;
  }

  return (
    <div className="flex h-full" ref={menuContainerRef}>
      <Sidebar />
      <Dialog.Root defaultOpen={isNew}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-gray-900 bg-opacity-30 data-[state=open]:animate-overlayShow fixed inset-0" />
          <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-md bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
            <Dialog.Title className="w-fit mx-auto mb-4 text-xl font-medium font-sans">
              Generate Equity Research Report
            </Dialog.Title>
            <Dialog.Description className="text-xs text-neutral-500 mb-6">
              An equity research report is a comprehensive analysis of a
              company&lsquo;s financial health, competitive position, and growth
              prospects, providing investors with an informed opinion on whether
              to buy, hold, or sell a particular stock.
            </Dialog.Description>
            <div className="flex justify-center">
              <Combobox
                label="Select a company"
                options={tickers}
                value={value}
                setValue={setValue}
              />
            </div>
            <div className="mt-[25px] flex justify-center">
              <Dialog.Close asChild>
                <button
                  className="bg-neutral-700 text-white hover:bg-neutral-600 focus:shadow-green7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-none"
                  onClick={() => {
                    console.log('generation report');
                    generateReport(value, editor);
                  }}
                >
                  Generate Report
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Close asChild>
              <button
                className="text-gray-600 hover:bg-gray-200 focus:shadow-gray-400 absolute top-[10px] right-[10px] inline-flex h-[20px] w-[20px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
                aria-label="Close"
              >
                <X />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {/* TODO: Top bar (title, upgrade, document settings, ai chat, citations/library) */}
      <div className="flex w-full h-full">
        <div className="relative flex flex-col flex-1 h-full overflow-hidden">
          {/* TODO: Table of contents */}
          <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
          <ContentItemMenu editor={editor} />
          <LinkMenu editor={editor} appendTo={menuContainerRef} />
          <TextMenu editor={editor} />
          <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
          <TableRowMenu editor={editor} appendTo={menuContainerRef} />
          <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
          <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />

          {/* TODO: Right column: ai chat and citations/library */}
        </div>
        {/* <AiChat /> */}
      </div>
    </div>
  );
}
