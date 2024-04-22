import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* <div className="md:hidden">
  
        <Image
          src="/examples/authentication-light.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="block dark:hidden"
          
        />
        <Image
          src="/examples/authentication-dark.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="hidden dark:block"
        />
      </div> */}
      <div className="container bg-background relative hidden h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        {/* TODO: fetch the link and label based on the link
            Should lead to the page creation from the demo domain
        */}
        {/* <Link
          href="/examples/authentication"
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'absolute right-4 top-4 md:right-8 md:top-8',
          )}
        >
          Login
        </Link> */}
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex gap-2 items-center text-lg font-semibold">
            <Image
              src="/white_coreline.png"
              alt="coreline logo"
              width={24}
              height={24}
            />
            Coreline
          </div>
          <div className="relative z-20 mt-auto">
            {/* <blockquote className="space-y-2"> */}
            <p className="text-2xl">
              Supercharge your financial report generation
            </p>
            {/* <footer className="text-sm">Sofia Davis</footer> */}
            {/* </blockquote> */}
          </div>
        </div>
        <div className="lg:p-8">{children}</div>
      </div>
    </>
  );
}
