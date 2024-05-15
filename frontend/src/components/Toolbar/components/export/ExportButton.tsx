// TODO: add type

import { Editor,  } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Chart } from './components/Chart';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { generateDocxFile } from './components/docxExport';
import { useInsertMutation } from '@supabase-cache-helpers/postgrest-react-query';
import { createClient } from '@/lib/supabase/client';

// import domtoimage from 'dom-to-image-more';

export const ExportButton = ({ editor }: { editor: Editor }) => {
  const ref = useRef<HTMLDivElement>(null);

  const client = createClient();
  const {mutateAsync: insertCache} = useInsertMutation(client.from('api_cache'), ['id'], '*');

  return (
    <div className="flex text-sm">
      <div className="hidden" id="hidden-container" ref={ref}>
        <Chart />
      </div>
      {/* <button
        onClick={() => {
          const json = editor.getJSON();
          const jsonString = JSON.stringify(json, null, 2);
          const blob = new Blob([jsonString], { type: 'application/json' });
          const url = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = 'data.json';
          link.click();

          URL.revokeObjectURL(url);
        }}
      >
        Export to JSON
      </button>
      <button
        onClick={() => {
          const html = editor.getHTML();
          const blob = new Blob([html], { type: 'text/html' });
          const url = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = 'data.html';
          link.click();

          URL.revokeObjectURL(url);
        }}
      >
        Export to HTML
      </button> */}
      <Button
        variant="ghost"
        className="text-foreground/60 z-30"
        onClick={async () => {
          const element = ref.current;
          if (!element) return;
          const canvas = await html2canvas(element, {
            logging: false,
            onclone: (clonedDoc) => {
              if (!clonedDoc.getElementById('hidden-container')) return;
              clonedDoc.getElementById('hidden-container')!.style.display =
                'block';
            },
          });

          const data = canvas.toDataURL('image/jpg');
          // const link = document.createElement('a');

          // if (typeof link.download === 'string') {
          //   console.log(data);

          //   link.href = data;
          //   link.download = 'image.jpg';

          //   document.body.appendChild(link);
          //   link.click();
          //   document.body.removeChild(link);
          // } else {
          //   window.open(data);
          // }
          // const node = ref.current;
          // const htmlString = ReactDOMServer.renderToString(<Chart />);
          // const res = await fetch('/api/export-image', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ html: htmlString }),
          // });
          // const img = await res.blob();
          // console.log(img);
          // const link = document.createElement('a');
          // link.download = 'my-image.png';
          // link.href = URL.createObjectURL(img);
          // link.click();
          // if (node) {
          //   console.log(typeof node);
          //   toPng(node, { cacheBust: true })
          //     .then((dataUrl) => {
          //       console.log(dataUrl);
          //       const link = document.createElement('a');
          //       link.download = 'my-image.png';
          //       link.href = dataUrl;
          //       link.click();
          //     })
          //     .catch((error) => {
          //       console.error(error);
          //     });
          // }
          const blob = await generateDocxFile('ARGUS', editor, data);
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'report.docx';
          link.click();
          URL.revokeObjectURL(url);
        }}
      >
        Export
      </Button>
    </div>
  );
};
