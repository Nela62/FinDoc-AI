'use client';

import {
  AiWriter,
  AiImage,
  AiGenerator,
  CharacterCount,
  Color,
  Document,
  Dropcursor,
  Figcaption,
  FileHandler,
  Focus,
  FontFamily,
  FontSize,
  Heading,
  HorizontalRule,
  ImageBlock,
  Link,
  Placeholder,
  Selection,
  SlashCommand,
  StarterKit,
  Subscript,
  Superscript,
  Table,
  TableOfContents,
  TableCell,
  TableHeader,
  TableRow,
  TextStyle,
  TrailingNode,
  Typography,
  Underline,
  Columns,
  Column,
} from '.';
import { ImageUpload } from './ImageUpload';
import { TableOfContentsNode } from './TableOfContentsNode';

export const ExtensionKit = () => [
  Document,
  Columns,
  AiWriter,
  AiImage,
  AiGenerator,
  Column,
  Selection,
  Heading.configure({ levels: [1, 2, 3] }),
  HorizontalRule,
  StarterKit.configure({
    document: false,
    dropcursor: false,
    heading: false,
    horizontalRule: false,
    // blockquote: false,
    // history: false,
    // codeBlock: false,
  }),
  TextStyle,
  FontSize,
  FontFamily,
  Color,
  TrailingNode,
  Link.configure({
    openOnClick: false,
  }),
  CharacterCount.configure({ limit: 50000 }),
  TableOfContents,
  TableOfContentsNode,
  // ImageUpload.configure({
  //   clientId: provider?.document?.clientID,
  // }),
  ImageBlock,
  // FileHandler.configure({
  //   allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
  //   onDrop: (currentEditor, files, pos) => {
  //     files.forEach(async () => {
  //       const url = await API.uploadImage();

  //       currentEditor.chain().setImageBlockAt({ pos, src: url }).focus().run();
  //     });
  //   },
  //   onPaste: (currentEditor, files) => {
  //     files.forEach(async () => {
  //       const url = await API.uploadImage();

  //       return currentEditor
  //         .chain()
  //         .setImageBlockAt({
  //           pos: currentEditor.state.selection.anchor,
  //           src: url,
  //         })
  //         .focus()
  //         .run();
  //     });
  //   },
  // }),
  Subscript,
  Superscript,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  Typography,
  Placeholder.configure({
    includeChildren: true,
    showOnlyCurrent: false,
    placeholder: () => '',
  }),
  // Placeholder.configure({
  //   emptyEditorClass: 'is-editor-empty',
  //   placeholder: 'Untitled',
  // }),
  SlashCommand,
  Focus,
  Figcaption,
  Dropcursor.configure({
    width: 2,
    class: 'ProseMirror-dropcursor border-black',
  }),
];
