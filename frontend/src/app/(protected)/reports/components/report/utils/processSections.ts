import { JSONContent } from '@tiptap/core';
import { markdownToJson } from '@/lib/utils/formatText';
import { Logger } from 'next-axiom';
import { section_ids } from '../../../utils/generateReportSections';
import { titles } from '../../../utils/generateReport';

export const processSections = (generatedBlocks: Record<string, string>) => {
  const log = new Logger();

  const generatedJson: JSONContent = { type: 'doc', content: [] };

  section_ids.forEach((id) => {
    try {
      console.log(id);

      const json = markdownToJson(generatedBlocks[id]);

      generatedJson.content?.push(
        {
          type: 'heading',
          attrs: {
            id: '220f43a9-c842-4178-b5b4-5ed8a33c6192',
            level: 2,
            'data-toc-id': '220f43a9-c842-4178-b5b4-5ed8a33c6192',
          },
          content: [
            {
              text: titles[id as keyof typeof titles],
              type: 'text',
            },
          ],
        },
        ...json.content,
      );
    } catch (error) {
      error instanceof Error &&
        log.error('Error generating report', {
          id,
          message: error.message,
          fnName: 'process sections (markdownToJson)',
        });
      console.error(error);
    }
  });

  return generatedBlocks;
};
