import { Editor } from '@tiptap/react';
import { ExportButton } from './export/ExportButton';
import Image from 'next/image';
import {
  ChevronRight,
  LibraryBig,
  MessageCircle,
  Search,
  Settings,
  Stamp,
} from 'lucide-react';
import { useBoundStore } from '@/stores/store';

export const TopBar = ({ editor }: { editor: Editor }) => {
  const selectedReport = useBoundStore((s) => s.selectedReport);

  return (
    <div
      style={{ boxShadow: '0px 1px 2px 0px rgb(0,0,0,0.2)' }}
      className="py-2 min-h-12 max-h-12 bg-white text-sm flex justify-between items-center px-4 w-full"
    >
      <div className="flex gap-2 h-full items-center">
        <Image
          className="h-[80%] w-auto"
          src="/finpanel_blue_logo.png"
          alt="logo"
          width={20}
          height={20}
        />
        <button className="w-40 border-[0.5px] border-zinc-300 h-[28px] rounded-[5px] shadow-sm relative flex justify-start items-center">
          <Search className="h-4 w-4 text-zinc-400 absolute left-1 top-1.5" />
          <p className="pl-6 text-zinc-500">Search</p>
        </button>
        <div className="flex ml-2 items-center gap-1 text-zinc-500">
          <p>Reports</p>
          <ChevronRight className="h-4 w-4" />
          {selectedReport.companyTicker ? (
            <>
              <p className="t">{selectedReport.companyTicker}</p>

              <ChevronRight className="h-4 w-4" />
              <p className="w-full">{selectedReport.title}</p>
            </>
          ) : (
            <p className="w-full">Create New Report</p>
          )}
        </div>
      </div>
      <div className="flex gap-4">
        {/* <ExportButton editor={editor} /> */}
        <button>
          <p className="">Export</p>
        </button>

        <div
          // style={{ boxShadow: '0px 1px 2px 0px rgb(0,0,0,0.2)' }}
          className="flex rounded-[5px] text-xs shadow-sm border-[0.5px] border-zinc-300"
        >
          <button className="flex gap-1 items-center text-zinc-600 px-2 py-1.5">
            <Stamp className="h-4 w-4" />
            <p className="font-medium">Audit</p>
          </button>
          <div className="h-full w-[1px] bg-zinc-300"></div>
          <button className="flex gap-1 items-center text-zinc-600 px-2 py-1.5">
            <MessageCircle className="h-4 w-4" />
            <p className="font-medium">Chat</p>
          </button>
          <div className="h-full w-[1px] bg-zinc-300"></div>
          <button className="flex gap-1 items-center text-zinc-600 px-2 py-1.5">
            <LibraryBig className="h-4 w-4" />
            <p className="font-medium">Library</p>
          </button>
          <div className="h-full w-[1px] bg-zinc-300"></div>
          <button className="flex gap-1 items-center text-zinc-600 px-2 py-1.5">
            <Settings className="h-4 w-4" />
            <p className="font-medium">Settings</p>
          </button>
        </div>
      </div>
    </div>
  );
};
