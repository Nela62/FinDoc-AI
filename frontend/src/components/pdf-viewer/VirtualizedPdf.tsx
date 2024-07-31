'use client';

import type { CSSProperties } from 'react';

import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  memo,
  useMemo,
} from 'react';
import { forwardRef } from 'react';

import { VariableSizeList as List } from 'react-window';
import { useWindowWidth, useWindowHeight } from '@wojtekmaj/react-hooks';
import { useInView } from 'react-intersection-observer';
import debounce from 'lodash.debounce';

import * as ScrollArea from '@radix-ui/react-scroll-area';

import {
  HORIZONTAL_GUTTER_SIZE_PX,
  OBSERVER_THRESHOLD_PERCENTAGE,
  PAGE_HEIGHT,
  PDF_HEADER_SIZE_PX,
  PDF_SIDEBAR_SIZE_PX,
  PDF_WIDTH_PERCENTAGE,
  VERTICAL_GUTTER_SIZE_PX,
} from './pdfDisplayConstants';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { multiHighlight } from '@/lib/utils/multi-line-highlight';
import { useBoundStore } from '@/providers/store-provider';
import { Document as PdfDocument } from '@/types/document';
import { createClient } from '@/lib/supabase/client';
import { fetchFile, getReportIdByUrl } from '@/lib/queries';
import { usePathname } from 'next/navigation';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { PDFCitation } from '@/types/citation';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  const { citationSnippetId, documentId } = useBoundStore((s) => s);
  const [shouldCenter, setShouldCenter] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  const supabase = createClient();
  const pathname = usePathname();
  const { data: report } = useQuery(
    getReportIdByUrl(supabase, pathname.split('/').pop() as string),
  );
  // const { data: citations, error: citationsError } = useQuery(
  //   fetchPDFCitation(supabase, citationSnippetId ?? ''),
  // );

  // Get which page is in view from an intersection observer
  const { ref: inViewRef, inView } = useInView({
    threshold: OBSERVER_THRESHOLD_PERCENTAGE * Math.min(1 / scale, 1),
  });

  // const selectedCitation: PDFCitation | undefined = useMemo(
  //   () => (citations ? citations[0] : undefined),
  //   [citations],
  // );
  // BUG: In-pdf link navigation doesn't work

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

  const documentFocused = documentId === file.id;

  // BUG: Highlighting doesn't work when clicking on citations in text editor

  // const conditionalHighlight = () => {
  //   // if (Number(selectedCitation.page) === pageNumber + 1)
  //   //   console.log(isHighlighted);
  //   if (
  //     documentFocused &&
  //     selectedCitation &&
  //     Number(selectedCitation.page) === pageNumber + 1 &&
  //     !isHighlighted
  //   ) {
  //     multiHighlight(
  //       selectedCitation.text,
  //       pageNumber,
  //       // pdfFocusState.citation.color,
  //     );
  //     setIsHighlighted(true);
  //   }
  // };

  // // TODO: fix this
  // const maybeHighlight = useCallback(debounce(conditionalHighlight, 50), [
  //   pageNumber,
  //   isHighlighted,
  //   selectedCitation,
  //   conditionalHighlight,
  // ]);

  const onPageRenderSuccess = useCallback(
    (page: { width: number }) => {
      showPageCanvas();
      // maybeHighlight();
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
    [showPageCanvas, listWidth],
  );

  // useEffect(() => {
  //   console.log('highlight useEffect');
  //   maybeHighlight();
  // }, [documentFocused, inView]);

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

    const TOP_BAR_SIZE_PX = 46;
    const height = (windowHeight || 0) - TOP_BAR_SIZE_PX - PDF_HEADER_SIZE_PX;
    // const newWidthPx = 0.42 * (windowWidth || 0) - 54;
    const newWidthPx = 0.42 * (windowWidth || 0) - 46;

    const [pdf, setPdf] = useState<PdfType | null>(null);
    const [pdfFile, setPdfFile] = useState<string | null>(null);
    const listRef = useRef<List>(null);

    const supabase = createClient();

    const pathname = usePathname();
    const { data: report } = useQuery(
      getReportIdByUrl(supabase, pathname.split('/').pop() as string),
    );
    const { citationSnippetId } = useBoundStore((s) => s);

    // const { data: citations, error: citationsError } = useQuery(
    //   fetchPDFCitation(supabase, citationSnippetId ?? ''),
    // );

    const fetchPdf = useCallback(async () => {
      const res = await fetchFile(supabase, file.url);
      const blob = await res.blob();

      // if (!url) return;
      setPdfFile(URL.createObjectURL(blob));
      // setPdfFile(url);
    }, [file.url, supabase]);

    useEffect(() => {
      fetchPdf();
    }, [fetchPdf]);

    // const selectedCitation: PDFCitation | undefined = useMemo(
    //   () => (citations ? citations[0] : undefined),
    //   [citations],
    // );

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

    const onItemClick = useCallback(
      ({ pageNumber: itemPageNumber }: { pageNumber: number }) => {
        const fixedPosition =
          Number(itemPageNumber) *
          (PAGE_HEIGHT + VERTICAL_GUTTER_SIZE_PX) *
          scale;
        if (listRef.current) {
          listRef.current.scrollTo(fixedPosition);
        }
      },
      [scale, listRef],
    );

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
      // selectedCitation &&
      // onItemClick({ pageNumber: Number(selectedCitation.page) - 1 });
    }, [
      pdf,
      setNumPages,
      setScaleFit,
      newWidthPx,
      onItemClick,
      // selectedCitation,
    ]);

    React.useImperativeHandle(ref, () => ({
      // This function can be called from the parent component
      scrollToPage: (page: number) => {
        onItemClick({ pageNumber: page });
      },
    }));

    const loadingDiv = () => {
      return (
        <div className={`h-full w-full flex items-center justify-center`}></div>
      );
    };

    useEffect(() => {
      async function getLoader() {}
      getLoader();
    }, []);

    return (
      // <div
      //   className={`relative h-[calc(100vh-60px)] w-full border-gray-pdf bg-gray-pdf items-center justify-center`}
      // >
      <div>
        {pdfFile ? (
          <Document
            key={file.url}
            onItemClick={onItemClick}
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={loadingDiv}
            onLoadError={(err) => {
              console.log(err);
            }}
          >
            {/* BUG: OverflowX and OverflowY */}
            {pdf ? (
              <ScrollArea.Root className="w-full overflow-hidden">
                <List
                  ref={listRef}
                  width={newWidthPx + HORIZONTAL_GUTTER_SIZE_PX}
                  height={height}
                  itemCount={pdf.numPages}
                  itemSize={getPageHeight}
                  estimatedItemSize={
                    (PAGE_HEIGHT + VERTICAL_GUTTER_SIZE_PX) * scale
                  }
                  outerElementType={ScrollArea.Viewport}
                >
                  {({ index, style }) => {
                    // console.log(index);
                    return (
                      <PageRenderer
                        file={file}
                        key={`page-${index}`}
                        pageNumber={index}
                        style={style}
                        scale={scale}
                        listWidth={newWidthPx}
                        setPageInView={setIndex}
                      />
                    );
                  }}
                </List>
                <ScrollArea.Scrollbar
                  className="flex select-none touch-none p-[1px] bg-zinc-100 transition-colors ease-out hover:bg-zinc-200 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
                  orientation="vertical"
                >
                  <ScrollArea.Thumb className="flex-1 bg-gray-400 hover:bg-gray-500 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
                </ScrollArea.Scrollbar>
                <ScrollArea.Scrollbar
                  className="flex select-none touch-none p-[1px] bg-zinc-100 transition-colors ease-out hover:bg-blackA5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
                  orientation="horizontal"
                >
                  <ScrollArea.Thumb className="flex-1 bg-gray-400 hover:bg-gray-500 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
                </ScrollArea.Scrollbar>
              </ScrollArea.Root>
            ) : null}
          </Document>
        ) : null}
      </div>
    );
  },
);
const MemoizedVirtualizedPDF = memo(VirtualizedPDF);
MemoizedVirtualizedPDF.displayName = 'VirtualizedPDF';

export default MemoizedVirtualizedPDF;
