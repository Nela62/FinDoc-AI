import { Editor } from '@tiptap/react';
import { ExportButton } from './export/ExportButton';

export const TopBar = ({ editor }: { editor: Editor }) => {
  return (
    <div className="py-4 text-sm flex">
      <ExportButton editor={editor} />
    </div>
  );
};
