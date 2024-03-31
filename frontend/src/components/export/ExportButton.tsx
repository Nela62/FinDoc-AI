// TODO: add type

import { Editor, EditorContent } from '@tiptap/react';

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
    </div>
  );
};
