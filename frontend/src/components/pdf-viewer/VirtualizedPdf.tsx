'use client';

import type { CSSProperties } from 'react';

import React, { useCallback, useState, useEffect, useRef, memo } from 'react';
import { forwardRef } from 'react';

import { VariableSizeList as List } from 'react-window';
import { useWindowWidth, useWindowHeight } from '@wojtekmaj/react-hooks';
import { useInView } from 'react-intersection-observer';
import debounce from 'lodash.debounce';

import {
  HORIZONTAL_GUTTER_SIZE_PX,
  OBSERVER_THRESHOLD_PERCENTAGE,
  PAGE_HEIGHT,
  PDF_HEADER_SIZE_PX,
  PDF_SIDEBAR_SIZE_PX,
  PDF_WIDTH_PERCENTAGE,
  VERTICAL_GUTTER_SIZE_PX,
} from './pdfDisplayConstants';

// import { Document, Page, pdfjs } from 'react-pdf';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { multiHighlight } from '@/lib/utils/multi-line-highlight';
import { useBoundStore } from '@/providers/store-provider';
import { Document as PdfDocument } from '@/stores/documents-store';
import { createServiceClient } from '@/lib/utils/supabase/client';

// Default values shown

// import PDFJSWorker from 'pdfjs-dist/build/pdf.worker.entry';

// pdfjs.GlobalWorkerOptions.workerSrc = PDFJSWorker;

// const pdfjsOptions = pdfjs.GlobalWorkerOptions;
// const pdfjsVersion = pdfjs.version;

// pdfjsOptions.workerSrc =
//   '//unpkg.com/pdfjs-dist@' +
//   String(pdfjsVersion) +
//   '/legacy/build/pdf.worker.min.js';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface PageType {
  getViewport: (arg0: { scale: number }) => { width: number };
}
interface PdfType {
  numPages: number;
  getPage: (val: number) => Promise<PageType>;
}

interface PageRenderer {
  file: PdfDocument;
  pageNumber: number;
  style: CSSProperties;
  scale: number;
  listWidth: number;
  setPageInView: (n: number) => void;
}
const PageRenderer: React.FC<PageRenderer> = ({
  file,
  pageNumber,
  style,
  scale,
  listWidth,
  setPageInView,
}) => {
  // const { pdfFocusState } = usePdfFocus();
  const { selectedCitation, selectedDocument } = useBoundStore((s) => s);
  const [shouldCenter, setShouldCenter] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  // Get which page is in view from an intersection observer
  const { ref: inViewRef, inView } = useInView({
    threshold: OBSERVER_THRESHOLD_PERCENTAGE * Math.min(1 / scale, 1),
  });

  // Prevents black flickering, which is fixed in 7.1.2, but we must
  // use 6.2.2 because highlights are broken in 7.1.2 :/
  // https://github.com/wojtekmaj/react-pdf/issues/1340#issuecomment-1483869537
  const containerRef = useRef<HTMLDivElement>(null);

  // Use `useCallback` so we don't recreate the function on each render
  // Need to set two Refs, one for the intersection observer, one for the container
  const setRefs = useCallback(
    (node: HTMLDivElement | null | undefined) => {
      // Ref's from useRef needs to have the node assigned to `current`
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current =
        node as HTMLDivElement | null;

      // Callback refs, like the one from `useInView`, is a function that takes the node as an argument
      inViewRef(node);
    },
    [inViewRef],
  );

  useEffect(() => {
    if (inView) {
      setPageInView(pageNumber);
    }
  }, [inView, pageNumber, setPageInView, inViewRef]);

  const hidePageCanvas = useCallback(() => {
    if (containerRef.current) {
      const canvas = containerRef.current.querySelector('canvas');
      if (canvas) canvas.style.visibility = 'hidden';
    }
  }, [containerRef]);

  const showPageCanvas = useCallback(() => {
    if (containerRef.current) {
      const canvas = containerRef.current.querySelector('canvas');
      if (canvas) canvas.style.visibility = 'visible';
    }
  }, [containerRef]);

  const onPageLoadSuccess = useCallback(() => {
    hidePageCanvas();
  }, [hidePageCanvas]);

  const onPageRenderError = useCallback(() => {
    showPageCanvas();
  }, [showPageCanvas]);

  const documentFocused = selectedDocument?.id === file.id;

  const maybeHighlight = useCallback(
    () =>
      debounce(() => {
        if (
          documentFocused &&
          selectedCitation &&
          selectedCitation.page === pageNumber + 1 &&
          !isHighlighted
        ) {
          multiHighlight(
            selectedCitation.text,
            pageNumber,
            // pdfFocusState.citation.color,
          );
          setIsHighlighted(true);
        }
      }, 50),
    [pageNumber, isHighlighted, documentFocused, selectedCitation],
  );

  const onPageRenderSuccess = useCallback(
    (page: { width: number }) => {
      // console.log("triggering rerender for page", index);
      showPageCanvas();
      maybeHighlight();
      // react-pdf absolutely pins the pdf into the upper left corner
      // so when the scale changes and the width is smaller than the parent
      // container, we need to use flex box to center the pdf.
      //
      // why not always center the pdf? when this condition is not true,
      // display: flex breaks scrolling. not quite sure why.
      if (listWidth > page.width) {
        setShouldCenter(true);
      } else {
        setShouldCenter(false);
      }
    },
    [showPageCanvas, listWidth, maybeHighlight],
  );

  useEffect(() => {
    maybeHighlight();
  }, [documentFocused, inView, maybeHighlight]);

  return (
    <div
      key={`${file.id}-${pageNumber}`}
      ref={setRefs}
      style={{
        ...style,
        padding: '10px',
        backgroundColor: 'WhiteSmoke',
        display: `${shouldCenter ? 'flex' : ''}`,
        justifyContent: 'center',
      }}
    >
      <Page
        scale={scale}
        onRenderSuccess={onPageRenderSuccess}
        onLoadSuccess={onPageLoadSuccess}
        onRenderError={onPageRenderError}
        pageIndex={pageNumber}
        renderAnnotationLayer
      />
    </div>
  );
};

interface VirtualizedPDFProps {
  file: PdfDocument;
  scale: number;
  setIndex: (n: number) => void;
  setScaleFit: (n: number) => void;
  setNumPages: (n: number) => void;
}
export interface PdfFocusHandler {
  scrollToPage: (page: number) => void;
}

const VirtualizedPDF = forwardRef<PdfFocusHandler, VirtualizedPDFProps>(
  ({ file, scale, setIndex, setScaleFit, setNumPages }, ref) => {
    const windowWidth = useWindowWidth();
    const windowHeight = useWindowHeight();
    // const height = (windowHeight || 0) - PDF_HEADER_SIZE_PX;
    const height = 800;
    const newWidthPx = 500;
    // const newWidthPx =
    //   PDF_WIDTH_PERCENTAGE * 0.01 * (windowWidth || 0) -
    //   PDF_SIDEBAR_SIZE_PX -
    //   HORIZONTAL_GUTTER_SIZE_PX;

    const [pdf, setPdf] = useState<PdfType | null>(null);
    const [pdfFile, setPdfFile] = useState<string | null>(null);
    const listRef = useRef<List>(null);

    const supabase = createServiceClient();

    const fetchPdf = useCallback(async () => {
      const { data, error } = await supabase.storage
        .from('public-documents')
        .download(file.url);
      if (error) console.log(error);
      if (!data) return;
      setPdfFile(URL.createObjectURL(data));
    }, [file.url]);

    useEffect(() => {
      fetchPdf();
    }, [fetchPdf]);

    useEffect(() => {
      // Changing scale changes the measurement of the item, so we need to bust the cache, see:
      // https://github.com/bvaughn/react-window/issues/344#issuecomment-540583132
      if (listRef.current) {
        listRef.current.resetAfterIndex(0);
      }
    }, [scale]);

    function onDocumentLoadSuccess(nextPdf: PdfType) {
      setPdf(nextPdf);
    }
    function getPageHeight(): number {
      const actualHeight = (PAGE_HEIGHT + VERTICAL_GUTTER_SIZE_PX) * scale;
      return actualHeight;
    }

    useEffect(() => {
      if (!pdf) {
        return;
      }
      async function loadFirstPage() {
        if (pdf) {
          await pdf
            .getPage(1)
            .then(
              (page: {
                getViewport: (arg0: { scale: number }) => { width: number };
              }) => {
                const pageViewport = page.getViewport({ scale: 1 });
                const pageWidth = pageViewport.width;
                const computedScaleFit = newWidthPx / pageWidth;
                // set scale to fit to page
                setScaleFit(computedScaleFit);
              },
            );
        }
      }
      loadFirstPage().catch(() => console.log('page load error'));
      setNumPages(pdf.numPages);
    }, [pdf, setNumPages, setScaleFit, newWidthPx]);

    React.useImperativeHandle(ref, () => ({
      // This function can be called from the parent component
      scrollToPage: (page: number) => {
        onItemClick({ pageNumber: page });
      },
    }));

    const onItemClick = ({
      pageNumber: itemPageNumber,
    }: {
      pageNumber: number;
    }) => {
      const fixedPosition =
        itemPageNumber * (PAGE_HEIGHT + VERTICAL_GUTTER_SIZE_PX) * scale;
      if (listRef.current) {
        listRef.current.scrollTo(fixedPosition);
      }
    };

    const loadingDiv = () => {
      return (
        <div className={`h-full w-full flex items-center justify-center`}>
          <l-line-spinner
            size="36"
            stroke="3"
            speed="1"
            color="black"
          ></l-line-spinner>
        </div>
      );
    };

    useEffect(() => {
      async function getLoader() {
        const { lineSpinner } = await import('ldrs');
        lineSpinner.register();
      }
      getLoader();
    }, []);

    return (
      // <div
      //   className={`relative h-[calc(100vh-60px)] w-full border-gray-pdf bg-gray-pdf items-center justify-center`}
      // >
      pdfFile ? (
        <Document
          key={file.url}
          onItemClick={onItemClick}
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={loadingDiv}
        >
          {pdf ? (
            <List
              ref={listRef}
              width={newWidthPx + HORIZONTAL_GUTTER_SIZE_PX}
              height={height}
              itemCount={pdf.numPages}
              itemSize={getPageHeight}
              estimatedItemSize={
                (PAGE_HEIGHT + VERTICAL_GUTTER_SIZE_PX) * scale
              }
            >
              {({ index, style }) => (
                <PageRenderer
                  file={file}
                  key={`page-${index}`}
                  pageNumber={index}
                  style={style}
                  scale={scale}
                  listWidth={newWidthPx}
                  setPageInView={setIndex}
                />
              )}
            </List>
          ) : null}
        </Document>
      ) : null
      // </div>
    );
  },
);
const MemoizedVirtualizedPDF = memo(VirtualizedPDF);

MemoizedVirtualizedPDF.displayName = 'VirtualizedPDF';

export default MemoizedVirtualizedPDF;
