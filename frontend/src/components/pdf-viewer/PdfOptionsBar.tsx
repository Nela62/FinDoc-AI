// PDFOptionsBar.tsx
import { useEffect, useState } from 'react';
import {
  ZoomOut,
  ZoomIn,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  MoveLeft,
} from 'lucide-react';
import { Document } from '@/stores/documents-store';
import { zoomLevels } from '@/hooks/usePdfViewer';
import { useBoundStore } from '@/providers/store-provider';
import { SidebarTabs } from '@/stores/sidedbar-tabs-store';
import { IconArrowBack } from '@tabler/icons-react';

interface PDFOptionsBarProps {
  file: Document;
  scrolledIndex: number;
  numPages: number;
  scaleText: string;
  nextPage: () => void;
  prevPage: () => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  goToPage: (n: number) => void;
  setZoomLevel: (percent: string) => void;
  zoomInEnabled: boolean;
  zoomOutEnabled: boolean;
}

export const PDFOptionsBar: React.FC<PDFOptionsBarProps> = ({
  file,
  scrolledIndex,
  numPages,
  scaleText,
  nextPage,
  prevPage,
  handleZoomIn,
  handleZoomOut,
  goToPage,
  setZoomLevel,
  zoomInEnabled,
  zoomOutEnabled,
}) => {
  const [zoomPopoverOpen, setZoomPopoverOpen] = useState(false);
  const { setSelectedTab, setSelectedCitationSourceNum, setDocumentId } =
    useBoundStore((state) => state);

  const handleZoomSelection = (zoom: string) => {
    setZoomLevel(zoom);
    setZoomPopoverOpen(false);
  };

  const handleGoBack = () => {
    setSelectedTab(SidebarTabs.Audit);
    setSelectedCitationSourceNum(null);
    setDocumentId('');
  };

  const [inputValue, setInputValue] = useState(`${scrolledIndex + 1}`);

  useEffect(() => {
    setInputValue(`${scrolledIndex + 1}`);
  }, [scrolledIndex]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = parseInt(inputValue, 10);
      if (!isNaN(value) && value > 0) {
        scrollToPage(value - 1);
      }
    }
  };

  const scrollToPage = (page: number) => {
    goToPage(page);
  };

  return (
    <div
      className={`flex h-[44px] w-full items-center justify-between border-b-2 text-xs z-10 bg-white rounded-t-[12px] px-3`}
    >
      <div className="flex w-1/2 gap-3 items-center justify-start">
        <button
          onClick={handleGoBack}
          className="flex gap-1 rounded-[5px] border-[0.5px] border-zinc-300 shadow-finpanel py-1 px-2"
        >
          <IconArrowBack className="h-4 w-4 text-zinc-600" />
          <p className="">Back</p>
        </button>
        <div className={`flex items-center gap-2 justify-center`}>
          <p className="text font-bold">{file.company_ticker}</p>
          <p className="">{file.doc_type}</p>
          <p className="">
            {file.year} {file.quarter && `Q${file.quarter}`}
          </p>
        </div>
      </div>
      <div className="flex w-fit items-center border-l border-l-gray-30 pl-1">
        <div className="flex gap-2 h-[30px] w-fit items-center">
          <div className="gap-1 flex text-gray-90">
            <button
              className="p-1 enabled:hover:rounded enabled:hover:bg-gray-15 disabled:text-gray-30 "
              onClick={prevPage}
              disabled={scrolledIndex === 0}
            >
              <ChevronUp className="h-4 w-4 text-zinc-600" />
            </button>
            <div className="flex items-center justify-center">
              <input
                className="ml-1 h-[25px] w-[36px] rounded border py-2 pl-1 text-left focus:outline-none"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="flex items-center"> / {numPages}</div>
            <button
              className="enabled:hover:rounded enabled:hover:bg-gray-15 disabled:text-gray-30 "
              onClick={nextPage}
              disabled={scrolledIndex === numPages - 1}
            >
              <ChevronDown className="h-4 w-4 text-zinc-600" />
            </button>
          </div>
          <div className="relative h-full border-l border-l-gray-30 pl-2">
            <div className="flex items-center h-full justify-between gap-2">
              <button
                className="text-gray-90 enabled:hover:rounded enabled:hover:bg-gray-15 disabled:text-gray-60"
                onClick={handleZoomOut}
                disabled={!zoomOutEnabled}
              >
                <ZoomOut className="h-4 w-4 text-zinc-600" />
              </button>
              <div
                className="cursor-pointer rounded hover:bg-gray-15"
                onClick={() => setZoomPopoverOpen(!zoomPopoverOpen)}
              >
                <div className="flex items-center gap-1 justify-center">
                  {scaleText}
                  {!zoomPopoverOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronUp size={16} />
                  )}
                </div>
              </div>
              {zoomPopoverOpen && (
                <div className="absolute right-[55px] top-[30px] z-20 mb-2 rounded border bg-white py-1 text-black shadow">
                  {zoomLevels.map((zoom: string, index: number) => (
                    <button
                      key={index}
                      className="block w-full px-4 py-1 text-left text-sm hover:bg-gray-200"
                      onClick={() => handleZoomSelection(zoom)}
                    >
                      {zoom}
                    </button>
                  ))}
                </div>
              )}
              <button
                className="text-gray-90 enabled:hover:rounded enabled:hover:bg-gray-15 disabled:text-gray-60 "
                onClick={handleZoomIn}
                disabled={!zoomInEnabled}
              >
                <ZoomIn className="h-4 w-4 text-zinc-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
