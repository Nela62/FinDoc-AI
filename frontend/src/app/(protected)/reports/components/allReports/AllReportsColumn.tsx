import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAllReports } from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { DotsHorizontalIcon, DotsVerticalIcon } from '@radix-ui/react-icons';
import {
  useDeleteMutation,
  useQuery,
} from '@supabase-cache-helpers/postgrest-react-query';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { DisplayIcon } from './DisplayIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const AllReportsColumn = ({
  userId,
  selectedReportId,
  setSelectedReportId,
}: {
  userId: string;
  selectedReportId: string | null;
  setSelectedReportId: Dispatch<SetStateAction<string | null>>;
}) => {
  const supabase = createClient();
  const { data: reports, isLoading } = useQuery(fetchAllReports(supabase));

  const { mutateAsync: deleteReport } = useDeleteMutation(
    supabase.from('reports'),
    ['id'],
    'id',
  );

  return (
    <div className="flex flex-col border-r-[0.5px] h-full gap-4">
      <div className="h-[41px] flex items-center px-4 border-b bg-white">
        <Button
          size="sm"
          className="bg-azure hover:bg-azure/95 w-fit"
          onClick={() => setSelectedReportId(null)}
        >
          + Create new report
        </Button>
      </div>

      {/* <div
        className={cn(
          'flex gap-3 h-10 hover:bg-azure/10 justify-center items-center cursor-pointer',
          !selectedReportId && 'bg-azure/20',
        )}
        onClick={() => setSelectedReportId(null)}
      >
        <div className="p-1 bg-azure text-white rounded-md">
          <Plus className="h-4 w-4" />
        </div>
        <p className="font-semibold">Create new report</p>
      </div> */}
      {/* <div className="pt-4 pb-2 flex gap-2 w-full items-center">
        <Separator className="shrink"></Separator>
        <p className="text-primary/30 text-sm">REPORTS</p>
        <Separator className="shrink"></Separator>
      </div> */}
      {isLoading || !reports ? (
        <Skeleton className="w-full h-4" />
      ) : (
        <div className="flex flex-col gap-4 h-[calc(100svh-58px)]">
          <h2 className={cn('font-semibold text-primary/80 px-4')}>Reports</h2>
          <ScrollArea>
            {...reports
              .sort((a, b) => {
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);
                return dateB.getTime() - dateA.getTime();
              })
              .map((report) => (
                <div
                  key={report.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedReportId(report.id)}
                >
                  <div
                    className={cn(
                      'text-sm group-hover:bg-azure/10 py-2 px-4 text-primary/70 font-medium flex my-2 gap-2',
                      selectedReportId === report.id && 'bg-azure/20',
                    )}
                  >
                    {report.companies?.cik &&
                      report.companies?.company_name && (
                        <DisplayIcon
                          cik={report.companies?.cik}
                          companyName={report.companies?.company_name}
                        />
                      )}
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex justify-between items-center w-full h-6">
                        <p className="">
                          {report.companies?.stock_name.split(' - ')[0]}
                        </p>

                        <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <DotsHorizontalIcon className="text-transparent h-6 w-6 group-hover:text-primary/70 hover:bg-azure/25 p-1 rounded-full" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem>Delete</DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you sure you want to delete this report?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  deleteReport({ id: report.id });
                                  setSelectedReportId(null);
                                }}
                              >
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      <div className="flex justify-between text-xs text-primary/55">
                        <p className="">
                          {report.company_ticker} - {report.type}
                        </p>
                        <p>{format(report.created_at, 'd MMMM yyyy')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
