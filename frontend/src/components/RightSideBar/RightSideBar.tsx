'use client';

import { useBoundStore } from '@/providers/store-provider';
import { InspectCitation } from './components/InspectCitation';
import { Audit } from './components/Audit';
import { ScrollArea } from '../ui/scroll-area';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export const RightSideBar = () => {
  const { selectedTab, setSelectedTab } = useBoundStore((state) => state);

  // return <Card></Card>;

  return selectedTab === 'Citation' ? (
    <div className="pt-3 pr-3 pl-2 h-full w-5/12">
      <InspectCitation />
    </div>
  ) : (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="">
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
    </Tabs>
  );
};
