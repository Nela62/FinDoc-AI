// TODO: add type

import { Editor } from '@tiptap/react';
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
  const { mutateAsync: insertCache } = useInsertMutation(
    client.from('api_cache'),
    ['id'],
    '*',
  );

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
          // TODO: get these dynamically
          const blob = await generateDocxFile({
            content: editor.getJSON(),
            img: data,
            companyName: 'Amazon Inc.',
            companyTicker: 'AMZN',
            companyDescription:
              "Amazon Inc. is a multinational technology company primarily operating in the e-commerce, cloud computing, and digital media industries. The company's key products and services include online retail, Amazon Web Services (AWS), and digital streaming, with revenue breakdown of 50% from online stores, 33% from third-party seller services, 13% from AWS, and 4% from other sources, as of 2021. Amazon's major subsidiaries include Whole Foods Market, Ring, and Twitch, serving customers worldwide. In 2021, Amazon reported total net sales of $469.8 billion, a 22% increase from the previous year, solidifying its position as a global leader in the e-commerce industry.",
            recommendation: 'BUY',
            targetPrice: 168,
            authorName: 'Coreline AI',
            authorCompanyName: 'Coreline',
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'report.docx';
          link.click();
          URL.revokeObjectURL(url);
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
        }}
      >
        Export
      </Button>
    </div>
  );
};
