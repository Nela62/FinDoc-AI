import { useBoundStore } from '@/providers/store-provider';
import { SidebarTabs } from '@/stores/sidedbar-tabs-store';

import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Audit } from './components/Audit';
import { InspectCitation } from './components/InspectCitation';

export const RightSideBar = () => {
  const { selectedTab, selectedCitation } = useBoundStore((state) => state);

  return (
    <div
      className={`${
        selectedTab === SidebarTabs.Citation ? 'w-1/2' : 'w-[360px]'
      } relative overflow-hidden h-full flex flex-col`}
    >
      <ScrollArea.Root className="overflow-hidden h-full w-full pl-2 pr-3 pt-3">
        <ScrollArea.Viewport
          className="h-full bg-white w-full rounded-t-[12px] border-zinc-300 border-[0.5px]"
          style={{ boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.2)' }}
        >
          {selectedTab === SidebarTabs.Audit && <Audit />}
          {selectedTab === SidebarTabs.Citation && <InspectCitation />}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex select-none touch-none p-0.5 transition-colors duration-[160ms] ease-out data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="flex-1 bg-gray-400 hover:bg-gray-500 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
};
