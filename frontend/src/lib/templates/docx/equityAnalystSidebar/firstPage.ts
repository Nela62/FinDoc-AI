import {
  BorderStyle,
  HeadingLevel,
  HorizontalPositionRelativeFrom,
  ISectionOptions,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalPositionRelativeFrom,
  WidthType,
} from 'docx';
import { bordersNone, defaultMargins, displayImage } from '../utils';
import { classicFooter } from '../../footers/classicFooter';
import { format } from 'date-fns';
import { metricsSidebar } from '../../metrics/sidebar';
import { SidebarMetrics } from '../../metrics/components/statistics';
import { Rating } from '../../metrics/components/ratings';

export const firstPageSection = async (
  authorCompanyName: string,
  header: TableRow[],
  businessDescription: string,
  summary: string[],
  authors: string[],
  recommendation: string,
  metrics: SidebarMetrics,
  ratings: Rating[],
  companyLogo: Blob,
  colors: string[],
  bottomFirstPageVisual: Blob,
  topFirstPageVisual: Blob,
): Promise<ISectionOptions> => {
  const [primaryColor, secondaryColor, accentColor] = colors;

  const displayTopFirstPageVisual = await displayImage({
    image: topFirstPageVisual,
    width: 500,
  });

  const displayBottomFirstPageVisual = await displayImage({
    image: bottomFirstPageVisual,
    width: 500,
  });

  const leftColumn = [
    new Paragraph({
      style: 'narrow',
      spacing: { before: 30 },
      text: businessDescription,
    }),
    new Paragraph({ children: [displayTopFirstPageVisual] }),
    new Paragraph({
      // border: {
      //   top: {
      //     style: BorderStyle.SINGLE,
      //     size: 4,
      //     color: '000000',
      //     space: 7,
      //   },
      // },

      text: "Analyst's Notes",
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      style: 'subtitle',
      text: `Analysis by ${authors[0]}, ${format(new Date(), 'MMMM d, yyyy')}`,
    }),
    new Paragraph({
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 4,
          color: 'a3a3a3',
          space: 1,
        },
      },
      heading: HeadingLevel.HEADING_2,
      children: [
        new TextRun('OUR RATING: '),
        new TextRun({ text: recommendation, color: accentColor }),
      ],
    }),
    ...summary.map(
      (point) =>
        new Paragraph({
          style: 'narrow',
          bullet: { level: 0 },
          spacing: { before: 60 },
          text: point,
        }),
    ),
    // TODO: make this a frame and position above the chart
    new Paragraph({
      border: {
        top: {
          style: BorderStyle.SINGLE,
          size: 4,
          color: 'a3a3a3',
          space: 1,
        },
      },
      children: [
        new TextRun({
          text: 'Market Data',
          color: primaryColor,
          size: 24,
          font: 'Arial Narrow',
          bold: true,
        }),
        new TextRun({
          font: 'Arial Narrow',
          size: 16,
          color: '000000',
          text: "\tPricing reflects previous trading day's closing price",
        }),
      ],
    }),
    new Paragraph({
      children: [displayBottomFirstPageVisual],
    }),
  ];

  const rightColumn = await metricsSidebar(
    metrics,
    ratings,
    companyLogo,
    authorCompanyName,
    colors,
  );

  return {
    properties: { page: { margin: { ...defaultMargins, top: 604 } } },
    footers: { default: classicFooter(authorCompanyName, primaryColor) },
    children: [
      new Table({
        borders: bordersNone,
        width: { size: 100.5, type: WidthType.PERCENTAGE },
        rows: [
          ...header,
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 7,
                borders: bordersNone,
                margins: { right: 120 },
                children: leftColumn,
              }),
              rightColumn,
            ],
          }),
        ],
      }),
    ],
  };
};
