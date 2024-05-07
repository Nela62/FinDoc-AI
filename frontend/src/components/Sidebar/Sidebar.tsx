'use client';

import { useBoundStore } from '@/providers/store-provider';
import { InspectCitation } from './components/citations/InspectCitation';
import { Audit } from './components/Audit';
import { ScrollArea } from '../ui/scroll-area';
import { Card } from '../ui/card';
import { TabsContent } from '../ui/tabs';

export const Sidebar = ({ reportId }: { reportId: string }) => {
  const { selectedTab, citationSnippetId } = useBoundStore((state) => state);

  return (
    <>
      <TabsContent value="Audit" className="mt-0">
        {citationSnippetId ? (
          <Card className=" overflow-hidden">
            <InspectCitation />
          </Card>
        ) : (
          <Card className="w-[360px] flex flex-col overflow-hidden relative h-full">
            <ScrollArea className="h-full w-[360px]">
              {selectedTab === 'Audit' && <Audit reportId={reportId} />}
            </ScrollArea>
          </Card>
        )}
      </TabsContent>
      <TabsContent value="Chat" className="mt-0">
        <Card className="w-[360px] flex flex-col overflow-hidden relative h-full">
          {/* <ScrollArea className="h-full w-[360px]">
              {selectedTab === 'Audit' && <Audit />}
            </ScrollArea> */}
        </Card>
      </TabsContent>
      <TabsContent value="Library" className="mt-0">
        <Card className="w-[360px] flex flex-col overflow-hidden relative h-full">
          {/* <ScrollArea className="h-full w-[360px]">
              {selectedTab === 'Audit' && <Audit />}
            </ScrollArea> */}
        </Card>
      </TabsContent>
      <TabsContent value="Settings" className="mt-0">
        <Card className="w-[360px] flex flex-col overflow-hidden relative h-full">
          {/* <ScrollArea className="h-full w-[360px]">
              {selectedTab === 'Audit' && <Audit />}
            </ScrollArea> */}
        </Card>
      </TabsContent>
    </>
  );
};
