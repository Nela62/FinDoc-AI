// TODO: add type

import { Editor, EditorContent, JSONContent } from '@tiptap/react';
import { generateDocxFile } from './components/docxExport';
import { Button } from '@/components/ui/button';

export const ExportButton = ({ editor }: { editor: Editor }) => {
  return (
    <div className="flex text-sm">
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
        className="text-foreground/60"
        onClick={async () => {
          const json: JSONContent = editor.getJSON();
          const blob = await generateDocxFile('ARGUS', editor);
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
