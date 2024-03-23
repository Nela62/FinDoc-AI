import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { v4 as uuid } from 'uuid';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';

import { AiGeneratorView } from './components/AiGeneratorView';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiGenerator: {
      setAiGenerator: () => ReturnType;
    };
  }
}

export const AiGenerator = Node.create({
  name: 'aiGenerator',

  group: 'block',

  draggable: true,

  addOptions() {
    return {
      authorId: undefined,
      authorName: undefined,
      HTMLAttributes: {
        class: `node-${this.name}`,
      },
    };
  },

  addAttributes() {
    return {
      id: {
        default: undefined,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => ({
          'data-id': attributes.id,
        }),
      },
      authorId: {
        default: undefined,
        parseHTML: (element) => element.getAttribute('data-author-id'),
        renderHTML: (attributes) => ({
          'data-author-id': attributes.authorId,
        }),
      },
      authorName: {
        default: undefined,
        parseHTML: (element) => element.getAttribute('data-author-name'),
        renderHTML: (attributes) => ({
          'data-author-name': attributes.authorName,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `div.node-${this.name}`,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  addCommands() {
    return {
      setAiGenerator:
        () =>
        ({ chain, state }) => {
          const { $to: $originTo } = state.selection;
          const startPos = $originTo.pos;

          const previewText =
            "Based on the provided context, Apple has a minority market share in the global smartphone, personal computer and tablet markets compared to its competitors. This smaller market share can make third-party software developers less inclined to prioritize developing applications for Apple's platforms.\nThe context does not provide specific details on Apple's market share or position in the wearables industry compared to rivals. It also does not comment on the strength of Apple's management team or their ability to execute on future growth initiatives.\nThe information focuses more on the challenges Apple faces due to its smaller market share in certain product categories, and the potential impacts on the availability of third-party software for its devices. Additional context would be needed to comprehensively address Apple's competitive position across its major product lines and the capabilities of its management.";

          const formattedPreviewText = previewText
            .split('\n')
            .map((p) => `<p>${p}</p>`)
            .join('');

          const currentChain = chain();
          currentChain.insertContent(formattedPreviewText);

          return currentChain
            .command(({ tr, dispatch }) => {
              if (dispatch) {
                const docEndPos = tr.doc.content.size;
                tr.setSelection(
                  TextSelection.create(tr.doc, startPos, docEndPos),
                );
              }

              return true;
            })
            .run();
        },
    };
  },
});

export default AiGenerator;
