import {
  AlignmentType,
  BorderStyle,
  Footer,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';
import { bordersNone } from '../docx/utils';

export const classicFooter = (
  authorCompanyName: string,
  primaryColor: string,
) =>
  new Footer({
    children: [
      new Table({
        borders: bordersNone,
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: {
                  ...bordersNone,
                  top: {
                    style: BorderStyle.SINGLE,
                    size: 6,
                    color: '000000',
                    space: 4,
                  },
                },
                width: { size: 50, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.LEFT,
                    children: [
                      new TextRun({
                        children: [
                          'Please see important information about this report on page ',
                          PageNumber.TOTAL_PAGES,
                        ],
                        bold: true,
                        size: 14,
                        color: '000000',
                      }),
                    ],
                  }),
                  new Paragraph({
                    spacing: { before: 120 },
                    alignment: AlignmentType.LEFT,
                    children: [
                      new TextRun({
                        text: `©2024 ${authorCompanyName}`,
                        size: 14,
                        color: '000000',
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                borders: {
                  ...bordersNone,
                  top: {
                    style: BorderStyle.SINGLE,
                    size: 6,
                    color: '000000',
                    space: 4,
                  },
                },
                width: { size: 50, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: authorCompanyName,
                        size: 28,
                        color: primaryColor,
                        font: 'Arial Narrow',
                        bold: true,
                      }),
                      new TextRun({
                        text: ' Analyst Report',
                        size: 28,
                        color: primaryColor,
                        font: 'Arial Narrow',
                      }),
                    ],
                    alignment: AlignmentType.RIGHT,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
