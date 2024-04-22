'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from './actions';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { fetchReportById } from '@/lib/queries';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';

export const Header = () => {
  const pathname = usePathname();
  const section = pathname.split('/')[1];
  const subSection = pathname.split('/')[2];

  const supabase = createClient();
  const { data, error } = useQuery(fetchReportById(supabase, subSection), {
    enabled:
      section !== 'reports' || subSection === 'new' || subSection === 'all',
  });

  let subSectionObject = { label: '', href: '' };

  if (section === 'reports') {
    switch (subSection) {
      case 'all':
        subSectionObject = { label: 'All Reports', href: '/reports/all' };
        break;
      case 'new':
        subSectionObject = { label: 'New Report', href: '/reports/new' };
        break;
      default:
        if (data) {
          subSectionObject = {
            label: data.company_ticker,
            href: '/reports/all',
          };
        }
    }
  }

  return (
    <header className="flex justify-between h-14 items-center gap-4 bg-muted/40 px-4">
      <Breadcrumb className="hidden md:flex grow">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/reports/all">Reports</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={subSectionObject.href}>{subSectionObject.label}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {subSection !== 'new' && subSection !== 'all' && data && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{data.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      <Button
        variant="outline"
        className="relative rounded-lg pl-4 md:w-40 lg:w-56 text-muted-foreground shadow-sm border-input font-light justify-start"
      >
        Search...
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <Image
              src="/placeholder-user.jpg"
              width={36}
              height={36}
              alt="Avatar"
              className="overflow-hidden rounded-full"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              await signOut();
            }}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
