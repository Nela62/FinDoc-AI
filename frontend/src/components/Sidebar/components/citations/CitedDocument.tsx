import { IconFileTypePdf } from '@tabler/icons-react';
import { Expand } from 'lucide-react';

import {
  type CitationSnippet,
  type CitedDocument as CitedDocumentType,
} from '@/types/citation';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useBoundStore } from '@/providers/store-provider';

import { type Document } from '@/types/document';

// TODO: ensure text colors are okay. put them as css variables if necessary
export const CitedDocument = ({
  citedDocument,
  citationSnippets,
}: {
  citedDocument: CitedDocumentType;
  citationSnippets: CitationSnippet[];
}) => {
  const { setCitation } = useBoundStore((state) => state);

  return (
    <div className="flex py-3 pl-3">
      <div className="">
        <p>[{citedDocument.sourceNum}]</p>
        {/* <div className="w-[1px] mx-auto h-full bg-zinc-300"></div> */}
      </div>
      <div className="text-left space-y-2 px-3">
        <div className="flex justify-between items-center gap-2 text-sm text-card-foreground font-medium pr-1">
          <div className="flex gap-2">
            <div>
              <p>{citedDocument.topTitle}</p>
              <p>{citedDocument.bottomTitle}</p>
            </div>
          </div>
          <IconFileTypePdf stroke={1.5} className="w-6 h-6 text-zinc-600" />
        </div>
        <Card className="space-y-1.5 py-2">
          {citationSnippets
            .sort((a, b) => a.sourceNum - b.sourceNum)
            .map((citation, i) => (
              <button
                onClick={() => {
                  console.log(citation.id, citedDocument.docId);
                  setCitation(citation.id, citedDocument.docId ?? '');
                }}
                key={citation.id}
                className={cn(
                  'text-xs text-foreground/90 px-2 space-y-1 cursor-pointer text-left',
                  i !== citationSnippets.length - 1 &&
                    'border-b-[0.5px] pb-1.5',
                )}
              >
                <div className="flex justify-between">
                  <p className="font-medium">
                    [{citedDocument.sourceNum}.{citation.sourceNum}]{' '}
                    {citation.title}
                  </p>
                  <Expand className="w-3.5 h-3.5 text-zinc-500" />
                </div>

                <p className="text-muted-foreground italic">
                  {citation.textSnippet}
                </p>
              </button>
            ))}
        </Card>
      </div>
    </div>
  );
};
