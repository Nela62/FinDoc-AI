'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFileUrl } from '@supabase-cache-helpers/storage-react-query';
import { createClient } from '@/lib/supabase/client';
import { TemplateConfig, TemplateData } from '../../Component';
import { MarketDataChart } from '@/lib/templates/ charts/MarketDataChart';
import { INCOME_STATEMENT_IBM } from '@/lib/data/income_statement_ibm';
import { EARNINGS_IBM } from '@/lib/data/earnings_ibm';
import { DAILY_STOCK_IBM } from '@/lib/data/daily_stock_ibm';
import { getPdfTemplate } from '../../utils/getPdfTemplate';
import { toPng } from 'html-to-image';
import { getDocxBlob } from '../../utils/getDocxBlob';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const defaultCompanyLogo = '/default_finpanel_logo.png';

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
  const [file, setFile] = useState<string | null>(null);

  const onRefChange = useCallback((node: HTMLDivElement) => {
    console.log('ref changed');
    setChart(node);
    // chartRef.current = node;
  }, []);

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
      const docxBlob = await getDocxBlob(
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

  useEffect(() => {
    if (chart) {
      getPdfFile()
        .then((blob) => URL.createObjectURL(blob))
        .then((url) => setFile(url))
        .catch((err) => console.error(err));
    }
  }, [chart, getPdfFile]);

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: {
    numPages: number;
  }): void {
    setNumPages(nextNumPages);
  }

  return (
    <div className="w-5/12">
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
      {file && (
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
          <ScrollArea>
            {Array.from(new Array(numPages), (el, index) => (
              <Page key={`page_${index + 1}`} pageNumber={index + 1} />
            ))}
          </ScrollArea>
        </Document>
      )}
    </div>
  );
};
