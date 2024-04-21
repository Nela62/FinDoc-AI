'use client';

import { useEffect } from 'react';

import { Content } from '@tiptap/react';

import { useBlockEditor } from '@/hooks/useBlockEditor';

import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { fetchCitations, fetchReportById } from '@/lib/queries';
import {
  Recommendation,
  ReportStatus,
  ReportType,
  type Report,
} from '@/types/report';
import { Card } from '@/components/ui/card';
import { useBoundStore } from '@/providers/store-provider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarTabs } from '@/stores/sidebar-tabs-store';
import { EditorComponent } from './EditorComponent';
import { EditorToolbar } from '@/components/Toolbar/EditorToolbar';
import { RightSidebar } from '@/components/RightSidebar/RightSidebar';

// TODO: Might want to add table of contents
// TODO: add body/metrics/formatting
// TODO: add loading skeleton

export const ReportPage = ({ url }: { url: string }) => {
  const { editor } = useBlockEditor();

  const supabase = createClient();

  const { data, error } = useQuery(fetchReportById(supabase, url));
  const { data: citationsData, error: citationsError } = useQuery(
    fetchCitations(supabase, url),
  );

  const { selectedTab, setSelectedTab, addCitations, resetCitations } =
    useBoundStore((state) => state);

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

  useEffect(() => {
    if (citationsData && citationsData.length > 0) {
      resetCitations();
      addCitations(citationsData);
    }
  }, [addCitations, resetCitations, citationsData, citationsError]);

  return editor ? (
    <Tabs
      value={selectedTab}
      onValueChange={(value) => setSelectedTab(value as SidebarTabs)}
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
        <EditorComponent editor={editor} />
        {/* BUG: why does this rerender every time an editor rerenders */}
        <RightSidebar />
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
