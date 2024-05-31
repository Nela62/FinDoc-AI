import {
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  HeightRule,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { bordersNone } from '../../docx/utils';

export type Rating = {
  name: string;
  list: string[];
  current: string;
};

const recommendationDisclosure = [
  'BUY-rated stocks are expected to outperform the market (the benchmark S&P 500 Index) on a risk-adjusted basis over the next year.',
  'HOLD-rated stocks are expected to perform in line with the market.',
  'SELL-rated stocks are expected to underperform the market on a risk-adjusted basis.',
];

const ratingCell = (
  rating: string,
  current: string,
  secondaryColor: string,
  accentColor: string,
) =>
  new TableCell({
    verticalAlign: 'center',
    borders: {
      top: { style: BorderStyle.SINGLE, size: 16, color: secondaryColor },
      bottom: {
        style: BorderStyle.SINGLE,
        size: 16,
        color: secondaryColor,
      },
      left: { style: BorderStyle.SINGLE, size: 16, color: secondaryColor },
      right: {
        style: BorderStyle.SINGLE,
        size: 16,
        color: secondaryColor,
      },
    },
    shading: {
      fill: rating === current ? accentColor : 'dbd9d9',
    },
    width: { size: 567, type: WidthType.DXA },
    children: [
      new Paragraph({
        style: 'narrow',
        alignment: AlignmentType.CENTER,
        // spacing: { before: 40 },
        children: [
          new TextRun({
            text: rating,
            bold: true,
            color: 'ffffff',
          }),
        ],
      }),
    ],
  });

export const displayRatings = (
  authorCompanyName: string,
  ratings: Rating[],
  primaryColor: string,
  secondaryColor: string,
  accentColor: string,
) => [
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { after: 100, before: 100 },
    text: `${authorCompanyName} Ratings`,
  }),
  new Table({
    borders: bordersNone,
    rows: ratings.map(
      (row) =>
        new TableRow({
          height: { value: '0.84cm', rule: HeightRule.EXACT },
          children: [
            new TableCell({
              margins: { top: 20, bottom: 20 },
              verticalAlign: 'center',
              borders: {
                top: {
                  style: BorderStyle.SINGLE,
                  size: 16,
                  color: secondaryColor,
                },
                bottom: {
                  style: BorderStyle.SINGLE,
                  size: 16,
                  color: secondaryColor,
                },
                left: {
                  style: BorderStyle.SINGLE,
                  size: 16,
                  color: secondaryColor,
                },
                right: {
                  style: BorderStyle.SINGLE,
                  size: 16,
                  color: secondaryColor,
                },
              },
              shading: { fill: secondaryColor },
              width: { size: 30, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: row.name,
                      size: 16,
                      font: 'Arial Narrow',
                      bold: true,
                    }),
                  ],
                }),
              ],
            }),
            ...row.list.map((rating) =>
              ratingCell(rating, row.current, secondaryColor, accentColor),
            ),
          ],
        }),
    ),
  }),
  new Paragraph({
    style: 'sidebar-narrow',
    spacing: { before: 120 },
    text: `${authorCompanyName} assigns a 12-month BUY, OVERWEIGHT, HOLD, UNDERWEIGHT or SELL rating to each stock.`,
  }),
  ...recommendationDisclosure.map(
    (point, i) =>
      new Paragraph({
        style: 'sidebar-narrow',
        numbering: { reference: 'sidebar-bullets', level: 0 },
        spacing: { after: i === recommendationDisclosure.length - 1 ? 120 : 0 },
        text: point,
      }),
  ),
];
