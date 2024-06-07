import {
  BorderStyle,
  HeadingLevel,
  ITableFloatOptions,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { bordersNone } from '../docx/utils';

type Statistic = {
  name: string;
  numbers: string[] | number[];
};

type Category = {
  name: string;
  statistics: Statistic[];
};

export type AnalysisMetrics = {
  years: string[] | number[];
  categories: Category[];
};

const disclosure =
  "The data contained on this page of this report has been provided by Alpha Vantage, Inc. (© 2024 Alpha Vantage, Inc. All Rights Reserved). This data (1) is proprietary to Alpha Vantage and/or its content providers; (2) may not be copied or distributed; and (3) is not warranted to be accurate, complete or timely. Neither Alpha Vantage nor its content providers are responsible for any damages or losses arising from any use of this information. Past performance is no guarantee of future results. This data is set forth herein for historical reference only and is not necessarily used in Finpanel's analysis of the stock set forth on this page of this report or any other stock or other security. All earnings figures are in GAAP.";

const displayCategoryTable = (
  category: Category,
  secondaryColor: string,
  accentColor: string,
  showHeaders: boolean = false,
  years?: string[] | number[],
  firstColumnName?: string,
) => {
  const rows = category.statistics.map(
    (stat, i) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            borders: bordersNone,
            shading: {
              fill:
                i % 2 === (showHeaders ? 1 : 0) ? undefined : secondaryColor,
            },
            children: [
              new Paragraph({ style: 'small-narrow', text: stat.name }),
            ],
          }),
          ...stat.numbers.map((num) => {
            const n = typeof num === 'number' ? num : parseFloat(num);

            return new TableCell({
              borders: bordersNone,
              shading: {
                fill:
                  i % 2 === (showHeaders ? 1 : 0) ? undefined : secondaryColor,
              },
              children: [
                new Paragraph({
                  style: 'small-narrow',
                  children: [
                    new TextRun({
                      text: num.toString(),
                      ...(n < 0 && { color: accentColor }),
                    }),
                  ],
                }),
              ],
            });
          }),
        ],
      }),
  );

  showHeaders &&
    years &&
    rows.unshift(
      new TableRow({
        children: [
          new TableCell({
            borders: bordersNone,
            children: [
              new Paragraph({
                text: firstColumnName,
                style: 'bold-narrow',
              }),
            ],
          }),
          ...years.map(
            (year) =>
              new TableCell({
                borders: bordersNone,
                children: [
                  new Paragraph({
                    text: year.toString(),
                    style: 'bold-narrow',
                  }),
                ],
              }),
          ),
        ],
      }),
    );

  return [
    new Paragraph({ heading: HeadingLevel.HEADING_2, text: category.name }),
    new Table({
      rows: rows,
      width: { size: 5300, type: WidthType.DXA },
      borders: bordersNone,
    }),
  ];
};

const leftColumn = (
  metrics: AnalysisMetrics,
  secondaryColor: string,
  accentColor: string,
) => [
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    text: 'Growth & Valuation Analysis',
  }),
  ...metrics.categories
    .map((category, i) =>
      displayCategoryTable(
        category,
        secondaryColor,
        accentColor,
        i === 0,
        metrics.years,
        '($ in Millions, except EPS)',
      ),
    )
    .flat(),
];

const rightColumn = (
  metrics: AnalysisMetrics,
  secondaryColor: string,
  accentColor: string,
) => [
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    text: 'Financial and Risk Analysis',
  }),
  ...metrics.categories
    .map((category, i) =>
      displayCategoryTable(
        category,
        secondaryColor,
        accentColor,
        i === 0,
        metrics.years,
        '',
      ),
    )
    .flat(),
];

export const financialAnalysisTable = (
  growthAndValuationAnalysisMetrics: AnalysisMetrics,
  financialAndRiskAnalysisMetrics: AnalysisMetrics,
  secondaryColor: string,
  accentColor: string,
  float?: ITableFloatOptions,
) => {
  return new Table({
    ...(float && { float: float }),
    width: { size: 10600, type: WidthType.DXA },
    // columnWidths: [5349.5, 5349.5],
    columnWidths: [5300, 5300],
    margins: { left: 20, right: 20 },
    borders: {
      bottom: {
        style: BorderStyle.NONE,
        size: 0,
        color: 'FFFFFF',
      },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            rowSpan: 2,
            children: leftColumn(
              growthAndValuationAnalysisMetrics,
              secondaryColor,
              accentColor,
            ),
          }),
          new TableCell({
            children: rightColumn(
              financialAndRiskAnalysisMetrics,
              secondaryColor,
              accentColor,
            ),
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            margins: { left: 50, bottom: 20, right: 50, top: 20 },
            children: [new Paragraph({ style: 'narrow', text: disclosure })],
          }),
        ],
      }),
    ],
  });
};
