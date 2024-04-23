import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PdfFocusHandler } from '@/components/pdf-viewer/VirtualizedPdf';
import { useBoundStore } from '@/providers/store-provider';
import { Document } from '@/stores/documents-store';

export const zoomLevels = [
  '50%',
  '75%',
  '100%',
  '125%',
  '150%',
  '200%',
  '300%',
  '400%',
];
const startZoomLevelIdx = 2;

const usePDFViewer = (file: Document) => {
  const [scrolledIndex, setScrolledIndex] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [scaleFit, setScaleFit] = useState(1.0);
  const [numPages, setNumPages] = useState(0);
  const [isPdfRendered, setIsPdfRendered] = useState(false);
  const [zoomLevelIdx, setZoomLevelIdx] = useState(startZoomLevelIdx);

  const { citation, documentId, citations } = useBoundStore((s) => s);

  const selectedCitation = useMemo(
    () => citations.find((c) => c.source_num === citation),
    [citations, citation],
  );

  const pdfFocusRef = useRef<PdfFocusHandler | null>(null);

  const goToPage = (page: number) => {
    if (pdfFocusRef.current) {
      pdfFocusRef.current.scrollToPage(page);
    }
  };

  useEffect(() => {
    if (!selectedCitation || !documentId) return;

    const activeDocumentId = documentId;
    if (activeDocumentId === file.id) {
      if (selectedCitation && selectedCitation.page) {
        goToPage(selectedCitation.page - 1);
      }
    }
  }, [file, documentId, selectedCitation]);

  const setCurrentPageNumber = useCallback((n: number) => {
    setScrolledIndex(n);
  }, []);

  const setZoomLevel = useCallback(
    (zoomLevel: string) => {
      const newZoomLevelIdx = zoomLevels.indexOf(zoomLevel);
      const newScale = percentToScale(zoomLevel) + scaleFit - 1;
      setScale(newScale);
      setTimeout(() => {
        goToPage(scrolledIndex);
      }, 30);
      setZoomLevelIdx(newZoomLevelIdx);
    },
    [scrolledIndex, scaleFit],
  );

  const handleZoomIn = useCallback(() => {
    const nextLevel = zoomLevelIdx + 1;
    if (nextLevel >= zoomLevels.length) {
      return;
    }
    setZoomLevel(zoomLevels[nextLevel] || '100%');
  }, [zoomLevelIdx, setZoomLevel]);
  // TODO: check if the removed dependencies were actually necessary
  const handleZoomOut = useCallback(() => {
    const nextLevel = zoomLevelIdx - 1;
    if (nextLevel < 0) {
      return;
    }
    setZoomLevel(zoomLevels[nextLevel] || '100%');
  }, [zoomLevelIdx, setZoomLevel]);

  const nextPage = () => {
    goToPage(scrolledIndex + 1);
  };

  const prevPage = () => {
    goToPage(scrolledIndex - 1);
  };

  const toPercentPlusBase = (n: number) => {
    return `${100 + n * 100}%`;
  };

  function percentToScale(percent: string): number {
    const number = parseInt(percent, 10);
    return number / 100;
  }

  const scaleDiff = Math.round((scale - scaleFit) * 10) / 10;
  const scaleText = toPercentPlusBase(scaleDiff);

  useEffect(() => {
    setScale(scaleFit);
  }, [scaleFit]);

  const zoomInEnabled = zoomLevelIdx < zoomLevels.length - 1;
  const zoomOutEnabled = zoomLevelIdx > 0;

  return {
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
    isPdfRendered,
    setIsPdfRendered,
    pdfFocusRef,
    goToPage,
    setZoomLevel,
    zoomInEnabled,
    zoomOutEnabled,
  };
};

export default usePDFViewer;
