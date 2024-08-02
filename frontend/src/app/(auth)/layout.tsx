import Image from 'next/image';
import { Montserrat } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';

const font = Montserrat({ subsets: ['latin'] });

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense>
      <div
        className={cn(
          'bg-slate-200 h-full flex justify-center items-center',
          font.className,
        )}
      >
        <div className="bg-white shadow-md w-[330px] rounded-md overflow-hidden">
          <div className="py-5 bg-azure flex justify-center items-center">
            <Image
              src="/stacked_findoc_logo.png"
              alt="Finpanel logo"
              className="h-16 w-auto"
              width={0}
              height={0}
              sizes="100vw"
            />
          </div>
          <div className="flex flex-col justify-center items-center gap-2 mt-4">
            {children}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
