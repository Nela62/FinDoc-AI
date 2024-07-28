'use client';

import { SpecialZoomLevel, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { Document, Page, pdfjs } from 'react-pdf';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCallback, useState } from 'react';
import { useFileUrl } from '@supabase-cache-helpers/storage-react-query';
import { createClient } from '@/lib/supabase/client';
import { TemplateData } from '../../Component';
import { PdfToolbar } from '@/components/pdf-viewer/Toolbar';

export const TemplatePreview = ({
  userId,
  templateData,
}: {
  userId: string;
  templateData: TemplateData;
}) => {
  const supabase = createClient();

  const { data: pdfUrl } = useFileUrl(
    supabase.storage.from('saved-templates'),
    `${userId}/default/equity-analyst`,
    'private',
    {
      refetchOnWindowFocus: false,
    },
  );

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar: PdfToolbar,
  });

  return (
    <div className="w-[50%] relative">
      <div className="h-[calc(100svh-2px)]">
        {pdfUrl && (
          <Viewer
            defaultScale={SpecialZoomLevel.PageWidth}
            fileUrl={pdfUrl}
            plugins={[defaultLayoutPluginInstance]}
          />
        )}
      </div>
    </div>
  );
};
