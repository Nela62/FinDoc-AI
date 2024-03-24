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
        ({ chain }) =>
          chain()
            .focus()
            .insertContent({
              type: this.name,
              attrs: {
                id: uuid(),
                authorId: this.options.authorId,
                authorName: this.options.authorName,
              },
            })
            .run(),
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(AiGeneratorView);
  },
});

export default AiGenerator;
