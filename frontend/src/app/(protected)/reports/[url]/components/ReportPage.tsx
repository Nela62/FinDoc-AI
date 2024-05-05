'use client';

import { Content } from '@tiptap/react';

import { useBlockEditor } from '@/hooks/useBlockEditor';

import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { fetchReportById } from '@/lib/queries';
import { Card } from '@/components/ui/card';
import { useBoundStore } from '@/providers/store-provider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarTabs } from '@/stores/sidebar-tabs-store';
import { EditorComponent } from './EditorComponent';
import { EditorToolbar } from '@/components/Toolbar/EditorToolbar';
import { Sidebar } from '@/components/Sidebar/Sidebar';

// TODO: Might want to add table of contents
// TODO: add body/metrics/formatting
// TODO: add loading skeleton

export const ReportPage = ({ reportId }: { reportId: string }) => {
  const supabase = createClient();

  const { data, error } = useQuery(fetchReportById(supabase, reportId));

  const { editor } = useBlockEditor(
    data?.id ?? '',
    (data?.json_content as Content) ?? '',
  );

  const { selectedTab, setSelectedTab } = useBoundStore((state) => state);

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
        <Sidebar reportId={reportId} />
      </div>
    </Tabs>
  ) : (
    <div>Loading...</div>
  );
};
