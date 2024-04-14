// TODO: add type

import { Editor, EditorContent, JSONContent } from '@tiptap/react';
import { generateDocxFile } from './components/docxExport';

export const ExportButton = ({ editor }: { editor: Editor }) => {
  return (
    <div>
      <button
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
      </button>
      <button
        onClick={async () => {
          const json: JSONContent = editor.getJSON();
          const blob = await generateDocxFile('ARGUS', json);
          const url = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = 'report.docx';
          link.click();

          URL.revokeObjectURL(url);
        }}
      >
        Export to DOCX
      </button>
    </div>
  );
};
