'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { ColumnDef } from '@tanstack/react-table';
import { File, ListFilter, Loader, PlusCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { fetchAllReports } from '@/lib/queries';
import { type Report } from '@/types/report';

const columns: ColumnDef<Report>[] = [
  { accessorKey: 'company_ticker', header: 'Ticker' },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => {
      return (
        <Link className="hover:underline" href={`/reports/${row.original.url}`}>
          {row.getValue('title')}
        </Link>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.getValue('status')}</Badge>;
    },
  },
  { accessorKey: 'type', header: 'Type' },
  {
    accessorKey: 'created_at',
    header: 'Date Created',
    cell: ({ row }) => {
      const date: Date = new Date(row.getValue('created_at'));
      const formattedDate = date.toLocaleDateString();
      return <p>{formattedDate}</p>;
    },
  },
  {
    accessorKey: 'updated_at',
    header: 'Last Updated',
    cell: ({ row }) => {
      const date: Date = new Date(row.getValue('updated_at'));
      const formattedDate = date.toLocaleDateString();
      return <p>{formattedDate}</p>;
    },
  },
];

export const AllReportsTable = () => {
  const router = useRouter();
  const supabase = createClient();

  const {
    data: reports,
    error,
    isLoading,
  } = useQuery(fetchAllReports(supabase));

  return (
    <div className="mx-4">
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
            <Button
              size="sm"
              className="h-7 gap-1"
              onClick={() => {
                router.push('/reports/new');
              }}
            >
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
                View and manage your financial reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reports ? (
                <DataTable columns={columns} data={reports as Report[]} />
              ) : (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              )}
            </CardContent>
            {reports && (
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Showing <strong>1-{reports.length}</strong> of{' '}
                  <strong>{reports.length}</strong> reports
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
