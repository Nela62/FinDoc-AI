'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MarketDataChart } from '@/lib/templates/charts/MarketDataChart';
import {
  DailyStockData,
  Earnings,
  IncomeStatement,
} from '@/types/alphaVantageApi';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { fetchAPICacheByReportId, fetchTemplateConfig } from '@/lib/queries';
import { useDocxGenerator } from '@/hooks/useDocxGenerator';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

type apiCacheData = {
  incomeStatement: IncomeStatement;
  earnings: Earnings;
  dailyStock: DailyStockData;
};

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};

const resizeObserverOptions = {};

export const ReportPreview = ({
  reportId,
  userId,
}: {
  reportId: string;
  userId: string;
}) => {
  const [numPages, setNumPages] = useState<number>();
  const [chart, setChart] = useState<HTMLDivElement | null>(null);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();
  const [file, setFile] = useState<string | null>(null);
  const [apiCacheData, setApiCacheData] = useState<apiCacheData | null>(null);

  const onRefChange = useCallback((node: HTMLDivElement) => {
    setChart(node);
  }, []);

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  const supabase = createClient();

  const { data: apiCache } = useQuery(
    fetchAPICacheByReportId(supabase, reportId),
  );

  useEffect(() => {
    if (!apiCache) return;

    const incomeStatement = apiCache.find((cache) =>
      cache.endpoint.includes('INCOME_STATEMENT'),
    );

    const earnings = apiCache.find((cache) =>
      cache.endpoint.includes('EARNINGS'),
    );

    const dailyStock = apiCache.find((cache) =>
      cache.endpoint.includes('TIME_SERIES_DAILY'),
    );

    if (incomeStatement && earnings && dailyStock) {
      setApiCacheData({
        incomeStatement: incomeStatement.json_data as IncomeStatement,
        earnings: earnings.json_data as Earnings,
        dailyStock: dailyStock.json_data as DailyStockData,
      });
    }
  }, [apiCache]);

  const { data: templateConfig } = useQuery(
    fetchTemplateConfig(supabase, reportId),
  );

  const {
    docxFile,
    pdfFile,
    isLoading,
    generateDocxBlob,
    generatePdf,
    targetPrice,
  } = useDocxGenerator(userId, reportId);

  useEffect(() => {
    if (isLoading) {
      console.log('still loading');
      return;
    }
    if (!docxFile && chart) {
      console.log('generating docx');
      generateDocxBlob(chart).then((blob) => generatePdf(blob));
    }
  }, [chart, docxFile, isLoading, generateDocxBlob, generatePdf]);

  useEffect(() => {
    if (pdfFile) {
      setFile(pdfFile);
    }
  }, [pdfFile]);

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: {
    numPages: number;
  }): void {
    setNumPages(nextNumPages);
  }

  return (
    <div className="w-[50%] relative">
      <div className="sr-only" id="hidden-container">
        {apiCache && templateConfig && targetPrice && apiCacheData && (
          <MarketDataChart
            colors={templateConfig.color_scheme}
            targetPrice={targetPrice}
            incomeStatement={apiCacheData.incomeStatement}
            earnings={apiCacheData.earnings}
            dailyStock={apiCacheData.dailyStock}
            ref={onRefChange}
          />
        )}
      </div>
      <div
        className="flex-col overflow-hidden bg-white border-l hidden md:flex"
        ref={setContainerRef}
      >
        <div className="w-full flex justify-center items-center h-10 border-b">
          <h2 className="font-semibold">Preview</h2>
        </div>
        {file && (
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            options={options}
          >
            <ScrollArea className="h-[calc(100vh-42px)]">
              {Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={containerWidth}
                />
              ))}
            </ScrollArea>
          </Document>
        )}
      </div>
    </div>
  );
};
