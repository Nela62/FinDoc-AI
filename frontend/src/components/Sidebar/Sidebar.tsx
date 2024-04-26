'use client';

import { useBoundStore } from '@/providers/store-provider';
import { InspectCitation } from './components/InspectCitation';
import { Audit } from './components/Audit';
import { ScrollArea } from '../ui/scroll-area';
import { Card } from '../ui/card';
import { TabsContent } from '../ui/tabs';

export const Sidebar = () => {
  const { selectedTab, citation, documentId } = useBoundStore((state) => state);

  return (
    <>
      <TabsContent value="Audit" className="mt-0">
        {citation ? (
          <Card className=" overflow-hidden">
            <InspectCitation />
          </Card>
        ) : (
          <Card className="w-[360px] flex flex-col overflow-hidden relative h-full">
            <ScrollArea className="h-full w-[360px]">
              {selectedTab === 'Audit' && <Audit />}
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
