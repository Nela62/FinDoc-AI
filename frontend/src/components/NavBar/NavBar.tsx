import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/Tooltip';
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

// TODO: highlight the selected item and get the current route
export const NavBar = () => {
  return (
    <aside className="hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 py-4">
        <Link
          href="#"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Briefcase className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Acme Inc</span>
        </Link>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/reports/new"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <PlusSquare className="h-5 w-5" />
              <span className="sr-only">Create New Report</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Create New Report</TooltipContent>
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
              href="#"
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
};
