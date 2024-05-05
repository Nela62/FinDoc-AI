import {
  type CitationSnippet,
  type CitedDocument as CitedDocumentType,
} from '@/types/citation';

// TODO: ensure text colors are okay. put them as css variables if necessary
export const CitedDocument = ({
  citedDocument,
  citationSnippets,
}: {
  citedDocument: CitedDocumentType;
  citationSnippets: CitationSnippet[];
}) => {
  return (
    <div>
      <div className="flex gap-2 border-b-[0.5px] px-3 text-sm py-3 text-left text-card-foreground">
        <p>{citedDocument.sourceNum}</p>
        <div>
          <p>{citedDocument.topTitle}</p>
          <p>{citedDocument.bottomTitle}</p>
        </div>
      </div>
      {citationSnippets.map((citation) => (
        <div key={citation.id}>
          <p>
            [{citedDocument.sourceNum}.{citation.sourceNum}] {citation.title}
          </p>
          <p>{citation.textSnippet}</p>
        </div>
      ))}
    </div>
  );
};
