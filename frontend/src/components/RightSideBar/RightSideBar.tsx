import { Send, SendHorizonal } from 'lucide-react';

export const RightSideBar = () => {
  return (
    <div className="w-80 h-full flex flex-col justify-end px-4 py-4">
      <div className="bg-white h-24 w-full rounded-[5px] border-[0.5px] border-zinc-300 p-2 relative">
        <p className="text-sm text-zinc-500">Ask me anything</p>
        <SendHorizonal className="h-5 w-5 text-zinc-500 absolute bottom-1 right-1" />
      </div>
    </div>
  );
};
