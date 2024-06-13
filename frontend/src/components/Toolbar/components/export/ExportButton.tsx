// TODO: add type

import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';
import {
  useInsertMutation,
  useQuery,
} from '@supabase-cache-helpers/postgrest-react-query';
import { createClient } from '@/lib/supabase/client';
import { fetchAPICacheByReportId } from '@/lib/queries';
import {
  BalanceSheet,
  DailyStockData,
  DailyStockDataPoint,
  Earnings,
  IncomeStatement,
  Overview,
} from '@/types/alphaVantageApi';
import { getNWeeksStock, getSidebarMetrics } from '@/lib/utils/financialAPI';
import { generateDocxFile } from './components/docxExport';
import { EARNINGS_IBM } from '@/lib/data/earnings_ibm';
import { INCOME_STATEMENT_IBM } from '@/lib/data/income_statement_ibm';
import { MarketDataChart } from '@/lib/templates/charts/MarketDataChart';
import { DAILY_IBM } from '@/lib/data/daily_imb';

export const ExportButton = ({
  editor,
  reportId,
}: {
  editor: Editor;
  reportId: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  // const { data: cacheData } = useQuery(
  //   fetchAPICacheByReportId(supabase, reportId),
  // );

  // const { mutateAsync: insertCache } = useInsertMutation(
  //   supabase.from('api_cache'),
  //   ['id'],
  //   '*',
  // );

  // if (!cacheData) return;

  // const earnings = cacheData.find((cache) =>
  //   cache.endpoint.includes('EARNINGS'),
  // )?.json_data;
  // const incomeStatement = cacheData.find((cache) =>
  //   cache.endpoint.includes('INCOME_STATEMENT'),
  // )?.json_data;
  // const dailyStock = cacheData.find((cache) =>
  //   cache.endpoint.includes('TIME_SERIES_DAILY'),
  // )?.json_data;
  // const overview = cacheData.find((cache) =>
  //   cache.endpoint.includes('OVERVIEW'),
  // )?.json_data;
  // const balanceSheet = cacheData.find((cache) =>
  //   cache.endpoint.includes('BALANCE_SHEET'),
  // )?.json_data;
  // console.log('export button');

  // if (!earnings || !incomeStatement || !dailyStock || !overview) return;

  return (
    <div className="text-sm">
      <div className="sr-only">
        {/* <Chart
          colors={['#1c4587', '#f4e9d3', '#006f3b']}
          earnings={earnings as Earnings}
          incomeStatement={incomeStatement as IncomeStatement}
          dailyStock={dailyStock as DailyStockData}
          targetPrice={168}
          ref={ref}
        /> */}
        <MarketDataChart
          colors={['#1c4587', '#f4e9d3', '#006f3b']}
          earnings={EARNINGS_IBM}
          incomeStatement={INCOME_STATEMENT_IBM}
          dailyStock={DAILY_IBM}
          targetPrice={168}
          ref={ref}
        />
      </div>
      <Button
        // variant="ghost"
        className="text-foreground/60 z-30 bg-red-600"
        onClick={async () => {
          const element = ref.current;
          if (!element) return;
          const dataUrl = await toPng(element)
            .then((url) => fetch(url))
            .then((res) => res.blob());

          // TODO: get these dynamically
          const blob = await generateDocxFile(dataUrl);
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'report.docx';
          link.click();
          URL.revokeObjectURL(url);
        }}
      >
        Export
      </Button>
    </div>
  );
};
