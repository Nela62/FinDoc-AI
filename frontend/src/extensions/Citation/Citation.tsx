import { mergeAttributes, Node } from '@tiptap/core';

export const Citation = Node.create({
  name: 'citation',

  content: 'text*',

  group: 'inline',

  inline: true,

  // TODO: Add onclick

  addOptions() {
    return {
      authorId: undefined,
      authorName: undefined,
      sourceNum: undefined,
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
      sourceNum: {
        default: undefined,
        parseHTML: (element) => element.getAttribute('data-source-num'),
        renderHTML: (attributes) => ({
          'data-source-num': attributes.sourceNum,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `span.node-${this.name}`,
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      `[${node.attrs.sourceNum}]`,
    ];
  },

  // addCommands() {
  //   return {
  //     setCitation:
  //       () =>
  //       ({ chain }: { chain: any }) =>
  //         chain().focus().setNode('citation').run(),
  //   };
  // },

  // addNodeView() {
  //   return ReactNodeViewRenderer(CitationView);
  // },
});

export default Citation;
