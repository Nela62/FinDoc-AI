import AiGenerator from '@/extensions/AiGenerator/AiGenerator';
import Figcaption from '@/extensions/Figcaption/Figcaption';
import HorizontalRule from '@/extensions/HorizontalRule/HorizontalRule';
import ImageBlock from '@/extensions/ImageBlock/ImageBlock';
import ImageUpload from '@/extensions/ImageUpload/ImageUpload';
import Link from '@/extensions/Link/Link';
import { TableOfContentsNode } from '@/extensions/TableOfContentsNode/TableOfContentsNode';
import { Editor } from '@tiptap/react';

export const isTableGripSelected = (node: HTMLElement) => {
  let container = node;

  while (container && !['TD', 'TH'].includes(container.tagName)) {
    container = container.parentElement!;
  }

  const gripColumn =
    container &&
    container.querySelector &&
    container.querySelector('a.grip-column.selected');
  const gripRow =
    container &&
    container.querySelector &&
    container.querySelector('a.grip-row.selected');

  if (gripColumn || gripRow) {
    return true;
  }

  return false;
};

export const isCustomNodeSelected = (editor: Editor, node: HTMLElement) => {
  const customNodes = [
    HorizontalRule.name,
    ImageBlock.name,
    ImageUpload.name,
    ImageBlock.name,
    Link.name,
    // AiWriter.name,
    // AiImage.name,
    AiGenerator.name,
    Figcaption.name,
    TableOfContentsNode.name,
  ];

  return (
    customNodes.some((type) => editor.isActive(type)) ||
    isTableGripSelected(node)
  );
};

export default isCustomNodeSelected;
