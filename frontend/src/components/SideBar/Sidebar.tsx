import { cn, getNanoId } from '@/lib/utils';
import { useDocumentStateStore } from '@/store';
import Link from 'next/link';

import { useRouter } from 'next/navigation';

export const Sidebar = () => {
  const documents = useDocumentStateStore((state) => state.documents);
  const addNewDocument = useDocumentStateStore((state) => state.addNewDocument);

  const selectedDocument = useDocumentStateStore((s) => s.selectedDocument);
  const setSelectedDocument = useDocumentStateStore(
    (s) => s.setSelectedDocument,
  );

  const { push } = useRouter();

  const createNewDocument = () => {
    const newDocument = {
      id: getNanoId(),
      title: 'Untitled',
    };
    addNewDocument(newDocument);
    setSelectedDocument(newDocument);
    push(`/${newDocument.id}?isNew=true`);
  };

  return (
    <div className="h-full w-48 border-r border-gray-300 p-2">
      <div className="flex flex-col gap-2 text-sm text-gray-600">
        <button onClick={createNewDocument}>
          <p className="text-blue-700 font-medium">+ New document</p>
        </button>
        {documents.map((doc) => (
          <Link
            key={doc.id}
            href={`/${doc.id}`}
            className={cn(selectedDocument.id === doc.id && 'font-medium')}
          >
            {doc.title}
          </Link>
        ))}
      </div>
    </div>
  );
};
