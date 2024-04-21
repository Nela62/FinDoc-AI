'use client';

import { API } from '@/lib/api';
import { StarterKit } from '@tiptap/starter-kit';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Underline } from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Typography } from '@tiptap/extension-typography';
import { Color } from '@tiptap/extension-color';
import { FocusClasses as Focus } from '@tiptap/extension-focus';
import { Dropcursor } from '@tiptap/extension-dropcursor';
import { Subscript } from '@tiptap/extension-subscript';
import { TableOfContents } from '@tiptap-pro/extension-table-of-contents';
import { Superscript } from '@tiptap/extension-superscript';
import { Paragraph } from '@tiptap/extension-paragraph';
import { FileHandler } from '@tiptap-pro/extension-file-handler';

import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import Columns from './MultiColumn/Columns';
import Column from './MultiColumn/Column';
import Citation from './Citation/Citation';
import Heading from './Heading/Heading';
import { HorizontalRule } from './HorizontalRule/HorizontalRule';
import FontSize from './FontSize/FontSize';
import { TrailingNode } from './TrailingNode/trailing-node';
import Link from './Link/Link';
import { TableOfContentsNode } from './TableOfContentsNode/TableOfContentsNode';
import ImageUpload from './ImageUpload/ImageUpload';
import ImageBlock from './ImageBlock/ImageBlock';
import { TableCell } from './Table/Cell';
import TableHeader from './Table/Header';
import SlashCommand from './SlashCommand/SlashCommand';
import Figcaption from './Figcaption/Figcaption';
import { Table } from './Table/Table';
import { TableRow } from './Table/Row';
import Document from '@tiptap/extension-document';
import { Selection } from './Selection/Selection';

export const ExtensionKit = () => [
  Document,
  Columns,
  TaskList,
  TaskItem.configure({ nested: true }),
  Column,
  Citation,
  Selection,
  Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
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
  // Highlight.configure({ multicolor: true }),
  Underline,
  CharacterCount.configure({ limit: 50000 }),
  TableOfContents,
  TableOfContentsNode,
  ImageUpload.configure({
    // clientId: provider?.document?.clientID,
  }),
  ImageBlock.configure({
    allowBase64: true,
  }),
  FileHandler.configure({
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    onDrop: (currentEditor, files, pos) => {
      files.forEach(async (file) => {
        const url = await API.uploadImage(file);

        currentEditor.chain().setImageBlockAt({ pos, src: url }).focus().run();
      });
    },
    onPaste: (currentEditor, files) => {
      files.forEach(async (file) => {
        const url = await API.uploadImage(file);

        return currentEditor
          .chain()
          .setImageBlockAt({
            pos: currentEditor.state.selection.anchor,
            src: url,
          })
          .focus()
          .run();
      });
    },
  }),
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
