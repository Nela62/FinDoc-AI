'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFileUrl } from '@supabase-cache-helpers/storage-react-query';
import { createClient } from '@/lib/supabase/client';
import { TemplateConfig, TemplateData } from '../../Component';
import { MarketDataChart } from '@/lib/templates/charts/MarketDataChart';
import { INCOME_STATEMENT_IBM } from '@/lib/data/income_statement_ibm';
import { EARNINGS_IBM } from '@/lib/data/earnings_ibm';
import { DAILY_STOCK_IBM } from '@/lib/data/daily_stock_ibm';
import { getPdfTemplate } from '../../utils/getPdfTemplate';
import { toPng } from 'html-to-image';
import { getTemplateDocxBlob } from '../../utils/getDocxBlob';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const defaultCompanyLogo = '/default_finpanel_logo.png';

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};

const resizeObserverOptions = {};

export const TemplatePreview = ({
  userId,
  templateConfig,
  templateData,
}: {
  userId: string;
  templateConfig: TemplateConfig;
  templateData: TemplateData;
}) => {
  const [numPages, setNumPages] = useState<number>();
  const [chart, setChart] = useState<HTMLDivElement | null>(null);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();
  // const [file, setFile] = useState<string | null>(null);
  const file =
    'https://phpgxkcyjkioartrccio.supabase.co/storage/v1/object/sign/sec-filings/sec-edgar-filings/AMZN/10-Q/0001018724-24-000083/primary-document.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJzZWMtZmlsaW5ncy9zZWMtZWRnYXItZmlsaW5ncy9BTVpOLzEwLVEvMDAwMTAxODcyNC0yNC0wMDAwODMvcHJpbWFyeS1kb2N1bWVudC5wZGYiLCJpYXQiOjE3MTc0MzUyODMsImV4cCI6MTc0ODk3MTI4M30.NSwy9dfRU96Dzyuk_CznBkZ-oUVeqeyDXoP3BuK9qLo&t=2024-06-03T17%3A21%3A23.613Z';

  const onRefChange = useCallback((node: HTMLDivElement) => {
    console.log('ref changed');
    setChart(node);
    // chartRef.current = node;
  }, []);

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  const supabase = createClient();

  const { data: authorCompanyLogoUrl } = useFileUrl(
    supabase.storage.from('company-logos'),
    `${userId}/${templateConfig.authorCompanyLogo}`,
    'private',
    {
      ensureExistence: true,
      refetchOnWindowFocus: false,
      enabled: !!templateConfig.authorCompanyLogo,
    },
  );

  const getPdfFile = useCallback(async () => {
    if (!chart) {
      throw new Error('No chart provided.');
    }

    const firstPageVisual = await toPng(chart)
      .then((url) => fetch(url))
      .then((res) => res.blob());
    const companyLogo = await fetch('/acme_logo.jpg').then((res) => res.blob());

    const authorCompanyLogo = await fetch(
      authorCompanyLogoUrl ?? defaultCompanyLogo,
    ).then((res) => res.blob());

    try {
      const docxBlob = await getTemplateDocxBlob(
        templateData,
        templateConfig,
        authorCompanyLogo,
        companyLogo,
        firstPageVisual,
      );

      const formData = new FormData();
      formData.append('file', docxBlob);

      const pdfBlob = await fetch('/api/convert/', {
        method: 'POST',
        body: formData,
      }).then((res) => res.blob());

      return pdfBlob;
    } catch (err) {
      console.error(err);
      throw new Error('Something when wrong.');
    }
  }, [authorCompanyLogoUrl, chart, templateConfig, templateData]);

  // useEffect(() => {
  //   if (chart) {
  //     getPdfFile()
  //       .then((blob) => URL.createObjectURL(blob))
  //       .then((url) => setFile(url))
  //       .catch((err) => console.error(err));
  //   }
  // }, [chart, getPdfFile]);

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
        <MarketDataChart
          colors={templateConfig.colorScheme.colors}
          targetPrice={182}
          incomeStatement={INCOME_STATEMENT_IBM}
          earnings={EARNINGS_IBM}
          dailyStock={DAILY_STOCK_IBM}
          ref={onRefChange}
        />
      </div>
      <div
        className="flex-col overflow-hidden bg-white border-l hidden md:flex"
        ref={setContainerRef}
      >
        <div className="w-full flex justify-center items-center h-10 border-b">
          <h2 className="font-semibold">{templateData.name}</h2>
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
