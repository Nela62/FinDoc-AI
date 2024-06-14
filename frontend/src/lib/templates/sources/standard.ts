import {
  Header,
  HeadingLevel,
  ISectionOptions,
  Paragraph,
  SectionType,
  Table,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { bordersNone, defaultMargins } from '../docx/utils';
import { classicFooter } from '../footers/classicFooter';

export const SourcesSection = (
  sourcesHeader: TableRow[],
  primaryColor: string,
  authorCompanyName: string,
  sources: string[],
): ISectionOptions => {
  return {
    properties: {
      page: { margin: { ...defaultMargins, top: 1900 } },
      type: SectionType.NEXT_PAGE,
      column: { count: 2, space: 300 },
    },
    headers: {
      default: new Header({
        children: [
          new Table({
            borders: bordersNone,
            width: { size: 100.5, type: WidthType.PERCENTAGE },
            rows: sourcesHeader,
          }),
        ],
      }),
    },
    footers: { default: classicFooter(authorCompanyName, primaryColor) },
    children: [
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 0 },
        text: 'Sources',
      }),
      ...sources.map((source) => new Paragraph(source)),
    ],
  };
};
