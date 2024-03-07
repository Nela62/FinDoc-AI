import Link from 'next/link';

export const Sidebar = () => {
  const documents = [
    { id: '1', title: 'Apple' },
    { id: '2', title: 'Amazon' },
  ];

  // TODO: get documentId from the URL
  const documentId = '1';

  return (
    <div className="h-full w-40 border-r border-gray-300 p-2">
      <div className="flex flex-col gap-2 text-sm text-gray-600">
        <button>
          <p className="text-blue-700 font-medium">+ New document</p>
        </button>
        {documents.map((doc) => (
          <Link
            key={doc.id}
            href={`/${doc.id}`}
            className={`${documentId === doc.id ? 'font-medium' : ''}`}
          >
            {doc.title}
          </Link>
        ))}
      </div>
    </div>
  );
};
