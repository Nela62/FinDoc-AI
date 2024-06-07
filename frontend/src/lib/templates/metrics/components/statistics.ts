import {
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { bordersNone } from '../../docx/utils';

export type SidebarMetrics = Record<string, Record<string, string | number>>;

const metricsArr = (metrics: SidebarMetrics, secondaryColor: string) =>
  Object.keys(metrics).map((category) => [
    new TableRow({
      children: [
        new TableCell({
          width: { size: '100%' },
          columnSpan: 2,
          borders: {
            ...bordersNone,
            bottom: { style: BorderStyle.SINGLE, size: 4, color: 'a3a3a3' },
          },
          shading: { fill: secondaryColor },
          children: [
            new Paragraph({ heading: HeadingLevel.HEADING_3, text: category }),
          ],
        }),
      ],
    }),
    ...Object.entries(metrics[category]).map(
      ([key, value]) =>
        new TableRow({
          height: { value: '0.15in', rule: 'exact' },
          children: [
            new TableCell({
              margins: { top: 20, bottom: 20 },
              borders: bordersNone,
              shading: { fill: secondaryColor },
              width: { size: 60, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  style: 'small-narrow',
                  text: key,
                }),
              ],
            }),
            new TableCell({
              margins: { top: 20, bottom: 20 },
              borders: bordersNone,
              shading: { fill: secondaryColor },
              children: [
                new Paragraph({
                  style: 'bold-narrow',
                  alignment: AlignmentType.RIGHT,
                  text: String(value),
                }),
              ],
            }),
          ],
        }),
    ),
  ]);

export const displayStatistics = (
  metrics: SidebarMetrics,
  secondaryColor: string,
) => [
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    border: {
      top: { style: BorderStyle.SINGLE, size: 4, color: '000000', space: 4 },
    },
    // spacing: { after: 40, before: 50 },
    text: 'Key Statistics',
  }),
  new Paragraph({
    style: 'sidebar-narrow',
    text: "Key Statistics pricing data reflects previous trading day's closing price. Other applicable data are trailing 12-months unless otherwise specified.",
  }),
  new Table({
    borders: bordersNone,
    rows: metricsArr(metrics, secondaryColor).flat(),
  }),
];
