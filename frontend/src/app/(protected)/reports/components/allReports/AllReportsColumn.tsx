import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAllReports } from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { DotsHorizontalIcon, DotsVerticalIcon } from '@radix-ui/react-icons';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { DisplayIcon } from './DisplayIcon';

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

  return (
    <div className="flex flex-col border-r-[0.5px] h-full">
      <div
        className={cn(
          'flex gap-3 py-6 hover:bg-azure/10 justify-center items-center cursor-pointer',
          !selectedReportId && 'bg-azure/20',
        )}
        onClick={() => setSelectedReportId(null)}
      >
        <div className="p-1 bg-azure text-white rounded-md">
          <Plus className="h-4 w-4" />
        </div>
        <p className="font-semibold">Create new report</p>
      </div>
      <div className="pt-4 pb-2 flex gap-2 w-full items-center">
        <Separator className="shrink"></Separator>
        <p className="text-primary/30 text-sm">REPORTS</p>
        <Separator className="shrink"></Separator>
      </div>
      {isLoading || !reports ? (
        <Skeleton className="w-full h-4" />
      ) : (
        <div className="flex flex-col gap-1 h-[calc(100vh-170px)]">
          <ScrollArea>
            {...reports.map((report) => (
              <div
                key={report.id}
                className="group pr-2 cursor-pointer"
                onClick={() => setSelectedReportId(report.id)}
              >
                <div
                  className={cn(
                    'text-sm group-hover:bg-azure/10 py-2 pl-4 pr-2 text-primary/70 font-medium flex my-0.5 gap-2',
                    selectedReportId === report.id && 'bg-azure/20',
                  )}
                >
                  {report.companies?.cik && report.companies?.company_name && (
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
                      <DotsHorizontalIcon className="text-transparent h-6 w-6 group-hover:text-primary/70 hover:bg-azure/25 p-1 rounded-full" />
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
