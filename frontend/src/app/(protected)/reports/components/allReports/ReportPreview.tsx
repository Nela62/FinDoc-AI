'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCallback, useEffect, useState } from 'react';
import { useDocxGenerator } from '@/hooks/useDocxGenerator';
import { ChartWrapper } from '@/lib/templates/charts/ChartWrapper';
import { useImageData } from '@/hooks/useImageData';
import { useBoundStore } from '@/providers/store-provider';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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
  const [images, setImages] = useState<Blob[] | null>(null);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();
  const [file, setFile] = useState<string | null>(null);

  const { generate, startGeneration, endGeneration, isGenerating } =
    useBoundStore((state) => state);

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  const {
    docxFile,
    pdfFile,
    isLoading,
    generateDocxBlob,
    generatePdf,
    targetPrice,
  } = useDocxGenerator(userId, reportId);

  const imageData = useImageData(reportId);

  useEffect(() => {
    if (isLoading) {
      console.log('still loading');
      return;
    }

    if ((!docxFile || generate) && images) {
      startGeneration();
      console.log('generating');
      generateDocxBlob(images)
        .then((blob) => generatePdf(blob))
        .then(() => {
          endGeneration();
        });
    }
  }, [
    images,
    docxFile,
    isLoading,
    generateDocxBlob,
    generatePdf,
    generate,
    startGeneration,
    endGeneration,
  ]);

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
    <>
      <AlertDialog open={isGenerating}>
        <AlertDialogContent className="w-fit">
          <AlertDialogHeader className="flex flex-col items-center">
            <Image
              src="/loading.gif"
              alt="loading image"
              height={60}
              width={60}
            />
            <AlertDialogDescription>
              Updating document...
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
      {!imageData.isLoading && targetPrice && (
        <ChartWrapper
          targetPrice={targetPrice}
          setCharts={setImages}
          {...imageData}
        />
      )}
      <div className="w-[50%] relative">
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
    </>
  );
};
