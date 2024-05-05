import { Card } from '@/components/ui/card';
import { Editor, EditorContent } from '@tiptap/react';
import { useRef } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import ImageBlockMenu from '@/extensions/ImageBlock/components/ImageBlockMenu';
import { ContentItemMenu } from '@/components/menus/ContentItemMenu/ContentItemMenu';
import LinkMenu from '@/components/menus/LinkMenu/LinkMenu';
import ColumnsMenu from '@/extensions/MultiColumn/menus/ColumnsMenu';
import TableRowMenu from '@/extensions/Table/menus/TableRow/TableRow';
import TableColumnMenu from '@/extensions/Table/menus/TableColumn/TableColumn';

export const EditorComponent = ({ editor }: { editor: Editor }) => {
  const menuContainerRef = useRef(null);

  return (
    <Card className="h-full overflow-hidden flex-1" ref={menuContainerRef}>
      <>
        <ScrollArea className="h-full w-full">
          <EditorContent editor={editor} className="flex-1" />
        </ScrollArea>
        <ContentItemMenu editor={editor} />
        <LinkMenu editor={editor} appendTo={menuContainerRef} />
        <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
        <TableRowMenu editor={editor} appendTo={menuContainerRef} />
        <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
        <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
      </>
    </Card>
  );
};
