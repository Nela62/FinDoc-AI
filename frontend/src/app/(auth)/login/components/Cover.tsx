'use client';

import Image from 'next/image';

export const Cover = () => {
  return (
    <div className="relative h-screen flex-col flex justify-between bg-muted p-10 text-white dark:border-r bg-zinc-900">
      {/* <div className="absolute inset-0 bg-zinc-900" /> */}
      <div className="relative z-20 flex gap-2 items-center text-lg font-semibold">
        <Image
          src="/white_coreline.png"
          alt="coreline logo"
          width={24}
          height={24}
        />
        Coreline
      </div>
      <div className="flex flex-col gap-1 absolute top-[18%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <p className="text-4xl">Supercharge your</p>
        <p className="text-4xl">financial reporting</p>
      </div>
    </div>
  );
};
