import { cn, getNanoId } from '@/lib/utils';
import { ReportType, useReportsStateStore } from '@/store';
import Link from 'next/link';

import { useRouter } from 'next/navigation';

export const NavBar = () => {
  const reports = useReportsStateStore((state) => state.reports);
  const addNewReport = useReportsStateStore((state) => state.addNewReport);

  const selectedReport = useReportsStateStore((s) => s.selectedReport);
  const setSelectedReport = useReportsStateStore((s) => s.setSelectedReport);

  const { push } = useRouter();

  const createNewDocument = () => {
    const newReport = {
      id: getNanoId(),
      title: 'Untitled',
      companyTicker: '',
      type: ReportType.Other,
    };
    push('/reports/' + newReport.id);
  };

  const companies = new Set(reports.map((report) => report.companyTicker));

  return (
    <div className="h-full w-48 min-w-48 py-4 mx-4">
      <div className="flex flex-col gap-2 mt-10 text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-gray-500 text-xs">REPORTS</p>
          <button onClick={createNewDocument}>
            <p className="text-xs font-medium border-[0.5px] border-zinc-300 rounded-md bg-white shadow-sm px-1.5 py-1">
              + New
            </p>
          </button>
        </div>
        {Array.from(companies).map((company) => (
          <div className="flex flex-col gap-2" key={company}>
            <p className="font-bold text-xs mt-2">{company}</p>
            {reports
              .filter((r) => r.companyTicker === company)
              .map((report) => (
                <Link
                  key={report.id}
                  href={`/reports/${report.id}`}
                  className={cn(
                    selectedReport.id === report.id && 'font-medium',
                    'text-xs',
                  )}
                >
                  {report.title.length > 30
                    ? report.title.slice(0, 30) + '...'
                    : report.title}
                </Link>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};
