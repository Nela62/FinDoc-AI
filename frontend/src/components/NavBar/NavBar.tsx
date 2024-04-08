import { cn, getNanoId } from '@/lib/utils';
import { ReportType } from '@/stores/reports-store';
import { useBoundStore } from '@/stores/store';

import Link from 'next/link';

import { useRouter } from 'next/navigation';

export const NavBar = () => {
  const {
    reports,
    addNewReport,
    selectedReport,
    setSelectedReport,
    addCitations,
    isUpdated,
    citations,
    setUpdated,
  } = useBoundStore((state) => state);

  const { push } = useRouter();

  const createNewDocument = () => {
    const newReport = {
      id: getNanoId(),
      title: 'Untitled',
      companyTicker: '',
      type: ReportType.Other,
      content: '',
    };
    addNewReport(newReport);
    push('/reports/' + newReport.id);
  };

  const companies = new Set(reports.map((report) => report.companyTicker));

  return (
    <div className="h-full w-48 min-w-48 py-1 mx-4">
      <div className="flex flex-col gap-2 text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-gray-500 text-xs">REPORTS</p>
          <button onClick={createNewDocument}>
            <p className="text-xs font-medium border-[0.5px] border-zinc-300 rounded-md bg-white shadow-sm px-2.5 py-1.5 hover:border-zinc-400">
              + New
            </p>
          </button>
        </div>
        {Array.from(companies).map((company) => (
          <div className="flex flex-col gap-2 pl-3" key={company}>
            <p className="font-bold text-xs mt-2">{company}</p>
            {reports
              .filter((r) => r.companyTicker === company)
              .map((report) => (
                <Link
                  key={report.id}
                  href={`/reports/${report.id}`}
                  className={cn(
                    selectedReport.id === report.id && 'font-semibold',
                    'text-xs',
                  )}
                >
                  {report.title.length > 30
                    ? report.title.slice(0, 27) + '...'
                    : report.title}
                </Link>
              ))}
          </div>
        ))}
        <button
          onClick={() => {
            const testCitations = [
              { node_id: '2', text: 'test ', source_num: 2 },
            ];
            setUpdated(true);
            console.log(isUpdated);
            console.log('inserting test citations');
            addCitations(testCitations);
            console.log(citations);
          }}
        >
          Add citations
        </button>
      </div>
    </div>
  );
};
