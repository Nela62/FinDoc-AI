// TODO: add type

import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateDocxFile } from './components/docxExport';
import { DAILY_IBM } from '@/lib/data/daily_ibm';
import { ChartWrapper } from '@/lib/templates/charts/ChartWrapper';
import { POLYGON_ANNUAL } from '@/lib/data/polygon_annual';
import { POLYGON_QUARTERLY } from '@/lib/data/polygon_quarterly';

export const ExportButton = ({
  editor,
  reportId,
}: {
  editor: Editor;
  reportId: string;
}) => {
  const [images, setImages] = useState<Blob[] | null>(null);

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
      <ChartWrapper
        colors={['#1c4587', '#f4e9d3', '#006f3b']}
        polygonAnnual={POLYGON_ANNUAL}
        polygonQuarterly={POLYGON_QUARTERLY}
        dailyStock={DAILY_IBM}
        targetPrice={168}
        setCharts={setImages}
      />
      <Button
        // variant="ghost"
        className=""
        onClick={async () => {
          if (!images) return;

          const blob = await generateDocxFile(images[0], images[1]);
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
