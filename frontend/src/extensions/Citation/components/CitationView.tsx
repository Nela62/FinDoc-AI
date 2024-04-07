import { NodeViewWrapper, NodeViewWrapperProps } from '@tiptap/react';

export const CitationView = ({
  editor,
  node,
  getPos,
  deleteNode,
}: NodeViewWrapperProps) => {
  const citation_num = node.attrs.sourceNum;
  return (
    <NodeViewWrapper data-drag-handle>
      <div
        className="text-indigo11 font-semibold focus:outline-none"
        onClick={() => {
          alert('clicked on citation');
        }}
      >
        <p>{`[${citation_num}]`}</p>
      </div>
    </NodeViewWrapper>
  );
};
