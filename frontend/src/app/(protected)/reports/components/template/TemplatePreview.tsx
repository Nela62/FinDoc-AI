'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCallback, useState } from 'react';
import { useFileUrl } from '@supabase-cache-helpers/storage-react-query';
import { createClient } from '@/lib/supabase/client';
import { TemplateData } from '../../Component';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};

const resizeObserverOptions = {};

export const TemplatePreview = ({
  userId,
  templateData,
}: {
  userId: string;
  templateData: TemplateData;
}) => {
  const [numPages, setNumPages] = useState<number>();
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  const supabase = createClient();

  const { data: pdfUrl } = useFileUrl(
    supabase.storage.from('saved-templates'),
    `${userId}/default/equity-analyst`,
    'private',
    {
      ensureExistence: true,
      refetchOnWindowFocus: false,
    },
  );

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: {
    numPages: number;
  }): void {
    setNumPages(nextNumPages);
  }

  return (
    <div className="w-[50%] relative">
      <div
        className="flex-col overflow-hidden bg-white border-l hidden md:flex"
        ref={setContainerRef}
      >
        <div className="w-full flex justify-center items-center h-10 border-b">
          <h2 className="font-semibold">{templateData.name}</h2>
        </div>
        {pdfUrl && (
          <Document
            file={pdfUrl}
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
