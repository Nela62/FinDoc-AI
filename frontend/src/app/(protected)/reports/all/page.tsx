'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Report, demoReports } from '@/stores/reports-store';
import { Button } from '@/components/ui/button';
import { File, ListFilter, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useBoundStore } from '@/providers/store-provider';
import { DataTable } from '@/components/ui/data-table';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createClient } from '@/lib/utils/supabase/client';

// TODO: add table pagination
// TODO: add tabler filtering
// TODO: add export functionality

const columns: ColumnDef<Report>[] = [
  { accessorKey: 'companyTicker', header: 'Ticker' },
  { accessorKey: 'title', header: 'Title' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.getValue('status')}</Badge>;
    },
  },
  { accessorKey: 'type', header: 'Type' },
  {
    accessorKey: 'createdAt',
    header: 'Date Created',
    cell: ({ row }) => {
      const date: Date = row.getValue('createdAt');
      const formattedDate = date.toLocaleDateString();
      return <p>{formattedDate}</p>;
    },
  },
  {
    accessorKey: 'lastUpdated',
    header: 'Last Updated',
    cell: ({ row }) => {
      const date: Date = row.getValue('lastUpdated');
      const formattedDate = date.toLocaleDateString();
      return <p>{formattedDate}</p>;
    },
  },
];

export default function ReportsPage() {
  const { reports, setReports } = useBoundStore((state) => state);
  const router = useRouter();

  const supabase = createClient();

  useEffect(() => {
    // TODO: import supabase types
    // TODO: fetch non demo user's reports
    supabase.auth.getUser().then((res) => {
      // @ts-ignore
      if (res.data.user && res.data.user.is_anonymous && reports.length === 0)
        setReports(demoReports);
    });
  }, []);

  function onRowClick(row: Report) {
    console.log('clicked on row');
    router.push(`/reports/${row.id}`);
  }

  return (
    <>
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Draft</TabsTrigger>
            <TabsTrigger value="draft">In Review</TabsTrigger>
            <TabsTrigger value="published" className="">
              Published
            </TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Archived</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-7 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
            <Button size="sm" className="h-7 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                New Report
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="all">
          <Card x-chunk="dashboard-06-chunk-0">
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Manage your products and view their sales performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={reports}
                onRowClick={onRowClick}
              />
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing <strong>1-{reports.length}</strong> of{' '}
                <strong>{reports.length}</strong> reports
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
