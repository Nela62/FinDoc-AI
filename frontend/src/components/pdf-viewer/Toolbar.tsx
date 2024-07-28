import { ToolbarProps, ToolbarSlot } from '@react-pdf-viewer/default-layout';
import { ReactElement } from 'react';

export const PdfToolbar = (Toolbar: (props: ToolbarProps) => ReactElement) => (
  <Toolbar>
    {(slots: ToolbarSlot) => {
      const {
        CurrentPageInput,
        Download,
        EnterFullScreen,
        GoToNextPage,
        GoToPreviousPage,
        NumberOfPages,
        Print,
        ShowSearchPopover,
        Zoom,
        ZoomIn,
        ZoomOut,
      } = slots;
      return (
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            width: '100%',
          }}
        >
          <div style={{ padding: '0px 2px' }}>
            <ShowSearchPopover />
          </div>
          <div style={{ padding: '0px 2px' }}>
            <ZoomOut />
          </div>
          <div style={{ padding: '0px 2px' }}>
            <Zoom />
          </div>
          <div style={{ padding: '0px 2px' }}>
            <ZoomIn />
          </div>
          <div style={{ padding: '0px 2px', marginLeft: 'auto' }}>
            <GoToPreviousPage />
          </div>
          <div style={{ padding: '0px 2px' }}>
            <CurrentPageInput /> / <NumberOfPages />
          </div>
          <div style={{ padding: '0px 2px' }}>
            <GoToNextPage />
          </div>
          <div style={{ padding: '0px 2px', marginLeft: 'auto' }}>
            <EnterFullScreen />
          </div>
          <div style={{ padding: '0px 2px' }}>
            <Download />
          </div>
          <div style={{ padding: '0px 2px' }}>
            <Print />
          </div>
        </div>
      );
    }}
  </Toolbar>
);
