import markdownit from 'markdown-it';
import { generateJSON } from '@tiptap/html';
import { ExtensionKit } from '@/extensions/extension-kit';

export const markdownToHtml = (markdown: string) => {
  const md = markdownit('commonmark');
  const html = md.render(markdown);
  return html;
};

// @ts-ignore
function transformContent(obj) {
  if (Array.isArray(obj)) {
    return obj.map(transformContent).flat();
  } else if (typeof obj === 'object' && obj !== null) {
    if (obj.type === 'text' && obj.text) {
      const text = obj.text.trim();
      const sentences = text.split(/(?<=[.!?])\s+/);

      const contentWithCitations = sentences.map((sentence: any) => {
        const citations = sentence.match(/\[\d+\.\d+\]/g) || [];

        if (citations.length === 0)
          return { type: 'text', text: sentence + ' ' };
        else {
          const textPart = sentence.split(/\[\d+\.\d+\]/)[0];
          return [
            { type: 'text', text: textPart.trim() },
            ...citations.map((citation: any) => ({
              type: 'citation',
              attrs: {
                sourceNum: parseFloat(citation.slice(1, -1)),
              },
            })),
            { type: 'text', text: '. ' },
          ];
        }
      });

      return contentWithCitations.flat();
    } else {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        // @ts-ignore
        acc[key] = transformContent(value);
        return acc;
      }, {});
    }
  }
  return obj;
}

export const markdownToJson = (markdown: string) => {
  const md = markdownit('commonmark');
  const html = md.render(markdown);
  const json = generateJSON(html, ExtensionKit());

  const transformedObject = transformContent(json);

  return transformedObject;
};
