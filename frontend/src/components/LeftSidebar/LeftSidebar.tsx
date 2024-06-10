'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Briefcase,
  Building2,
  Database,
  Files,
  Home,
  MessageSquareText,
  Plus,
  PlusCircle,
  PlusSquare,
  Settings,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Lato } from 'next/font/google';

const lato = Lato({
  weight: ['100', '300', '400', '700', '900'],
  subsets: ['latin'],
});

const navigationButtons = [{ icon: PlusSquare, name: 'New Report', href: '' }];

// TODO: highlight the selected item and get the current route
export const LeftSidebar = () => {
  const pathname = usePathname();
  const section = pathname.split('/')[1];

  const [isExpanded, setIsExpanded] = useState(false);

  const CollapsedSidebar = (
    <aside className="hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 py-4">
        <Link href="#" className="">
          <Image
            src="/finpanel_logo_blue.png"
            className="group-hover:scale-110"
            alt="coreline logo"
            height={30}
            width={30}
          />
          {/* <Briefcase className="h-4 w-4 transition-all group-hover:scale-110" /> */}
          <span className="sr-only">Acme Inc</span>
        </Link>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/reports/new"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <PlusSquare className="h-5 w-5" />
              <span className="sr-only">New Report</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">New Report</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/reports/all"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Files className="h-5 w-5" />
              <span className="sr-only">Reports</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Reports</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 cursor-not-allowed"
            >
              <Building2 className="h-5 w-5" />
              <span className="sr-only">Companies</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Companies - coming soon!</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 cursor-not-allowed"
            >
              <MessageSquareText className="h-5 w-5" />
              <span className="sr-only">Chat</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Chat - coming soon!</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 cursor-not-allowed"
            >
              <Database className="h-5 w-5" />
              <span className="sr-only">Data Sources</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            Data Sources - coming soon!
          </TooltipContent>
        </Tooltip>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/settings"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 cursor-not-allowed"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Settings - coming soon!</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );

  const ExpandedSidebar = (
    <aside
      className={cn(
        'hidden w-[240px] text-base flex-col border-r sm:flex bg-sidebar-dark px-3',
        lato.className,
      )}
    >
      <nav className="flex flex-col items-center gap-4 px-2 py-4">
        <Link href="#" className="">
          <Image
            src="/default_finpanel_logo.png"
            className="transition-all h-10 w-fit"
            alt="coreline logo"
            height={0}
            width={0}
            sizes="100vw"
          />
          {/* <Briefcase className="h-4 w-4 transition-all group-hover:scale-110" /> */}
          <span className="sr-only">Acme Inc</span>
        </Link>
        <Link
          href="/reports/new"
          className="flex w-full px-2 py-1.5 gap-3 items-center rounded-lg text-white/80 hover:text-white hover:bg-white/10"
        >
          <PlusSquare className="h-5 w-5" />
          <p className="">New Report</p>
        </Link>
        <Link
          href="/reports/all"
          className={cn(
            'flex w-full gap-3 items-center rounded-lg transition-colors px-2 py-1.5',
            section === 'reports'
              ? 'bg-accent/20 font-semibold text-white shadow-sm'
              : 'text-white/80 hover:text-white',
          )}
        >
          <Files className="h-5 w-5" />
          <p className="">Reports</p>
        </Link>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-100 transition-colors hover:text-foreground md:h-8 md:w-8 cursor-not-allowed"
            >
              <Building2 className="h-5 w-5" />
              <span className="sr-only">Companies</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Companies - coming soon!</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-100 transition-colors hover:text-foreground md:h-8 md:w-8 cursor-not-allowed"
            >
              <MessageSquareText className="h-5 w-5" />
              <span className="sr-only">Chat</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Chat - coming soon!</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-100 transition-colors hover:text-foreground md:h-8 md:w-8 cursor-not-allowed"
            >
              <Database className="h-5 w-5" />
              <span className="sr-only">Data Sources</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            Data Sources - coming soon!
          </TooltipContent>
        </Tooltip>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/settings/personal"
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg   transition-colors hover:text-foreground md:h-8 md:w-8',
                section === 'settings'
                  ? 'text-accent-foreground bg-accent'
                  : 'text-zinc-100',
              )}
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );

  return isExpanded ? ExpandedSidebar : CollapsedSidebar;
};
