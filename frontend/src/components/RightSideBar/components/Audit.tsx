import { useBoundStore } from '@/providers/store-provider';
import { Citation } from '@/stores/citations-store';
import { SidebarTabs } from '@/stores/sidedbar-tabs-store';
import { IconFileTypePdf } from '@tabler/icons-react';
import { Expand } from 'lucide-react';
import { DocumentType } from '@/stores/documents-store';

export const Audit = () => {
  const {
    citations,
    setSelectedCitation,
    setSelectedTab,
    documents,
    setDocumentId,
  } = useBoundStore((state) => state);

  // TODO: handle long text wrapping
  const CitationComponent = ({ citation }: { citation: Citation }) => {
    const doc = documents.find((doc) => citation.doc_id === doc.id);
    if (!doc) {
      return null;
    }

    return (
      <button
        className="flex gap-2 border-b-[0.5px] border-zinc-300 px-3 text-sm py-3 text-left"
        onClick={() => {
          setSelectedCitation(citation.source_num);
          setSelectedTab(SidebarTabs.Citation);
          setDocumentId(doc.id);
        }}
      >
        <p className="text-zinc-600">{`[${citation.source_num}]`}</p>
        <div className="flex flex-col">
          <div className="flex justify-between">
            <div className="flex flex-col">
              <p className="text-zinc-600 font-medium text-xs">
                {`${doc.company_name} (${doc.company_ticker})`}
              </p>
              <p className="text-zinc-600 font-medium text-xs">{`${
                doc.doc_type
              } ${
                doc.doc_type === DocumentType.TenK
                  ? doc.year
                  : `${doc.quarter} ${doc.year}`
              } - Page ${citation.page}`}</p>
            </div>

            <div className="flex gap-1">
              <IconFileTypePdf stroke={2} className="w-4 h-4 text-zinc-500" />
              <Expand className="w-4 h-4 text-zinc-500" />
            </div>
          </div>
          {/* TODO: install a package to limit text to three lines only */}
          <p className="text-xs mt-1 text-zinc-400 font-medium italic">
            {`"${citation.text.slice(0, 141)}..."`}
          </p>
        </div>
      </button>
    );
  };
  return (
    <>
      <p className="italic mt-3 font-semibold text-xs text-center text-zinc-500">
        {/* TODO: add filters and change to displaying num out of num citations when filtered */}
        {citations.length === 0
          ? 'No citations to display'
          : `Displaying all ${citations.length} citations`}
      </p>
      {citations.map((citation) => (
        <CitationComponent key={citation.node_id} citation={citation} />
      ))}
    </>
  );
};
