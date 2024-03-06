'use client';

import { Sidebar } from '@/components/SideBar';
import { ContentItemMenu, LinkMenu, TextMenu } from '@/components/menus';
import ImageBlockMenu from '@/extensions/ImageBlock/components/ImageBlockMenu';
import { ColumnsMenu } from '@/extensions/MultiColumn/menus';
import { TableColumnMenu, TableRowMenu } from '@/extensions/Table/menus';
import { useBlockEditor } from '@/hooks/useBlockEditor';
import { EditorContent } from '@tiptap/react';
import { useRef } from 'react';

export type AiState = {
  isAiLoading: boolean;
  aiError?: string | null;
};

export default function Document({ params }: { params: { document: string } }) {
  const { document: documentId } = params;

  // TODO: Fetch document

  const { editor, characterCount } = useBlockEditor();
  const menuContainerRef = useRef(null);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex h-full" ref={menuContainerRef}>
      <Sidebar />
      <div className="relative flex flex-col flex-1 h-full overflow-hidden">
        {/* TODO: Top bar (title, upgrade, document settings, ai chat, citations/library) */}
        <div className="relative flex flex-1 h-full">
          {/* TODO: Table of contents */}
          <EditorContent editor={editor} />
          <ContentItemMenu editor={editor} />
          <LinkMenu editor={editor} appendTo={menuContainerRef} />
          <TextMenu editor={editor} />
          <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
          <TableRowMenu editor={editor} appendTo={menuContainerRef} />
          <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
          <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
        </div>
        {/* TODO: Right column: ai chat and citations/library */}
      </div>
    </div>
  );
}
