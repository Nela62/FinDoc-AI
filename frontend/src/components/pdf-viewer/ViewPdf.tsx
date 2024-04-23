import usePDFViewer from '@/hooks/usePdfViewer';
import { PDFOptionsBar } from './PdfOptionsBar';
import React from 'react';
import MemoizedVirtualizedPDF from './VirtualizedPdf';
import { Document } from '@/stores/documents-store';

interface ViewPdfProps {
  file: Document;
}

export const ViewPdf: React.FC<ViewPdfProps> = ({ file }) => {
  const {
    scrolledIndex,
    setCurrentPageNumber,
    scale,
    setScaleFit,
    numPages,
    setNumPages,
    handleZoomIn,
    handleZoomOut,
    nextPage,
    prevPage,
    scaleText,
    pdfFocusRef,
    goToPage,
    setZoomLevel,
    zoomInEnabled,
    zoomOutEnabled,
  } = usePDFViewer(file);

  return (
    <div
      className="relative"
      // className="relative border-[0.5px] border-zinc-300 rounded-t-[12px] bg-zinc-100"
      // style={{ boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.2)' }}
    >
      {scaleText && (
        <PDFOptionsBar
          file={file}
          scrolledIndex={scrolledIndex}
          numPages={numPages}
          scaleText={scaleText}
          nextPage={nextPage}
          prevPage={prevPage}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
          goToPage={goToPage}
          setZoomLevel={setZoomLevel}
          zoomInEnabled={zoomInEnabled}
          zoomOutEnabled={zoomOutEnabled}
        />
      )}

      <MemoizedVirtualizedPDF
        key={`${file.id}`}
        ref={pdfFocusRef}
        file={file}
        setIndex={setCurrentPageNumber}
        scale={scale}
        setScaleFit={setScaleFit}
        setNumPages={setNumPages}
      />
    </div>
  );
};
