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
  firstPageVisual: Blob | Table | undefined,
  metrics: SidebarMetrics,
  ratings: Rating[],
  companyLogo: Blob,
  colors: string[],
): Promise<ISectionOptions> => {
  const [primaryColor, secondaryColor, accentColor] = colors;

  const graph = await fetch('/first_graph.png').then((res) => res.blob());
  const displayGraph = await displayImage({
    image: graph,
    width: 500,
  });

  const displayFirstPageVisual =
    firstPageVisual instanceof Blob
      ? await displayImage({
          image: firstPageVisual,
          width: 500,
          // floating: {
          //   horizontalPosition: {
          //     relative: HorizontalPositionRelativeFrom.LEFT_MARGIN,
          //     offset: 0,
          //   },
          //   verticalPosition: {
          //     relative: VerticalPositionRelativeFrom.PAGE,
          //     offset: 5865000,
          //   },
          // },
        })
      : firstPageVisual;

  const leftColumn = [
    new Paragraph({
      style: 'narrow',
      spacing: { before: 30 },
      text: businessDescription,
    }),
    new Paragraph({ children: [displayGraph] }),
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
  ];

  displayFirstPageVisual &&
    leftColumn.push(
      new Paragraph({
        children: [displayFirstPageVisual],
      }),
    );

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
