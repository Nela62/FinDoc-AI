'use client';

import { useEffect, useRef, useState } from 'react';

import { Content, EditorContent } from '@tiptap/react';

import { useBlockEditor } from '@/hooks/useBlockEditor';
import { EditorToolbar } from '@/components/Toolbar';
import { ContentItemMenu, LinkMenu } from '@/components/menus';
import { ScrollArea } from '@/components/ui/scroll-area';
import ImageBlockMenu from '@/extensions/ImageBlock/components/ImageBlockMenu';
import { ColumnsMenu } from '@/extensions/MultiColumn/menus';
import { TableColumnMenu, TableRowMenu } from '@/extensions/Table/menus';
import { createClient } from '@/lib/utils/supabase/client';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { getReportById } from '@/lib/queries';
import {
  Recommendation,
  ReportStatus,
  ReportType,
  type Report,
} from '@/types/report';
import { Card } from '@/components/ui/card';
import { useBoundStore } from '@/providers/store-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Audit } from '@/components/RightSidebar/components/Audit';

// TODO: Might want to add table of contents
// TODO: add body/metrics/formatting

export const EditorComponent = ({ url }: { url: string }) => {
  const menuContainerRef = useRef(null);

  const { editor } = useBlockEditor();

  const supabase = createClient();
  const { data, error } = useQuery(getReportById(supabase, url));

  const { selectedTab, setSelectedTab } = useBoundStore((state) => state);

  useEffect(() => {
    if (!data || error || !editor) {
      return;
    }
    const parsedReport: Report = {
      ...data,
      id: data.id ?? '',
      type: data.type as ReportType,
      recommendation: data.recommendation
        ? (data.recommendation as Recommendation)
        : undefined,
      status: data.status as ReportStatus,
      json_content: data.json_content as Content,
      html_content: data.html_content as Content,
    };

    editor.commands.setContent(parsedReport.json_content);
  }, [data, editor, error]);

  return editor ? (
    <Tabs
      value={selectedTab}
      onValueChange={setSelectedTab}
      className="px-4 flex flex-col gap-1"
    >
      <Card className="h-[40px] w-full mb-2 flex justify-between overflow-hidden">
        <EditorToolbar editor={editor} />
        <TabsList className="h-full bg-white">
          <TabsTrigger
            value="Audit"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow data-[state=active]:hover:bg-primary/90"
          >
            Audit
          </TabsTrigger>
          <TabsTrigger
            value="Chat"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow data-[state=active]:hover:bg-primary/90"
          >
            Chat
          </TabsTrigger>
          <TabsTrigger
            value="Library"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow data-[state=active]:hover:bg-primary/90"
          >
            Library
          </TabsTrigger>
          <TabsTrigger
            value="Settings"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow data-[state=active]:hover:bg-primary/90"
          >
            Settings
          </TabsTrigger>
        </TabsList>
      </Card>
      <div className="flex gap-3 h-[calc(100vh-120px)]">
        <Card className="h-full overflow-hidden flex-1" ref={menuContainerRef}>
          <>
            <ScrollArea className="h-full w-full">
              <EditorContent editor={editor} className="flex-1" />
            </ScrollArea>
          </>
        </Card>
        <TabsContent value="Audit" className="mt-0">
          <Card className="w-[360px] flex flex-col overflow-hidden relative h-full">
            <ScrollArea className="h-full w-[360px]">
              {selectedTab === 'Audit' && <Audit />}
            </ScrollArea>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  ) : (
    <div>Loading...</div>
  );
};
{
  /* <Tabs value={selectedTab} onValueChange={setSelectedTab} className="">
            <TabsList>
              <TabsTrigger value="Audit">Audit</TabsTrigger>
              <TabsTrigger value="Chat">Chat</TabsTrigger>
              <TabsTrigger value="Library">Library</TabsTrigger>
              <TabsTrigger value="Settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="Audit">
              <Card className="mr-4 w-[360px] flex flex-col overflow-hidden relative h-full">
                <ScrollArea className="h-[calc(100vh-114px)] w-[360px]">
                  {selectedTab === 'Audit' && <Audit />}
                </ScrollArea>
              </Card>
            </TabsContent>
          </Tabs> */
}

{
  /* <ContentItemMenu editor={editor} />
              <LinkMenu editor={editor} appendTo={menuContainerRef} />
              <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
              <TableRowMenu editor={editor} appendTo={menuContainerRef} />
              <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
              <ImageBlockMenu editor={editor} appendTo={menuContainerRef} /> */
}
