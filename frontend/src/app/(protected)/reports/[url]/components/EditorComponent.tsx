import { Card } from '@/components/ui/card';
import { Editor, EditorContent } from '@tiptap/react';
import { useRef } from 'react';

import { ContentItemMenu, LinkMenu } from '@/components/menus';
import { ScrollArea } from '@/components/ui/scroll-area';
import ImageBlockMenu from '@/extensions/ImageBlock/components/ImageBlockMenu';
import { ColumnsMenu } from '@/extensions/MultiColumn/menus';
import { TableColumnMenu, TableRowMenu } from '@/extensions/Table/menus';

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
