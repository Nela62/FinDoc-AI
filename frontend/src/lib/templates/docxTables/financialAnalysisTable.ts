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
  primaryColor: string,
  secondaryColor: string,
  accentColor: string,
  showHeaders: boolean = false,
  firstColumnWidth: number = 40,
  years?: string[] | number[],
  firstColumnName?: string,
) => {
  const rows = category.statistics.map(
    (stat, i) =>
      new TableRow({
        children: [
          new TableCell({
            margins: { left: 120, right: 120 },
            width: { size: firstColumnWidth, type: WidthType.PERCENTAGE },
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
            const n =
              typeof num === 'number'
                ? num
                : num.includes('(')
                ? -parseFloat(num.slice(1, -1))
                : parseFloat(num);

            return new TableCell({
              borders: bordersNone,
              shading: {
                fill:
                  i % 2 === (showHeaders ? 1 : 0) ? undefined : secondaryColor,
              },
              width: {
                size: (100 - firstColumnWidth) / (years?.length ?? 4),
                type: WidthType.PERCENTAGE,
              },
              children: [
                new Paragraph({
                  style: 'small-narrow',
                  children: [
                    new TextRun({
                      text: num.toString(),
                      ...(n < 0 && { color: 'ab0434' }),
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
            margins: { left: 120, right: 120 },
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
    new TableRow({
      children: [
        new TableCell({
          margins: { left: 120, right: 120 },
          columnSpan: years && years.length + 1,
          children: [
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              text: category.name,
            }),
          ],
        }),
      ],
    }),
    ...rows,
  ];
};

const leftColumnWidth = 6700;

const leftColumn = (
  metrics: AnalysisMetrics,
  primaryColor: string,
  secondaryColor: string,
  accentColor: string,
) =>
  new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            margins: { left: 120, right: 120 },
            columnSpan: metrics.years.length + 1,
            borders: bordersNone,
            shading: { fill: primaryColor },
            children: [
              new Paragraph({
                spacing: { after: 40 },
                children: [
                  new TextRun({
                    text: 'Growth & Valuation Analysis',
                    color: 'ffffff',
                    size: 24,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      ...metrics.categories
        .map((category, i) =>
          displayCategoryTable(
            category,
            primaryColor,
            secondaryColor,
            accentColor,
            i === 0,
            30,
            metrics.years,
            '($ in Millions, except EPS)',
          ),
        )
        .flat(),
    ],
    width: { size: leftColumnWidth, type: WidthType.DXA },
    borders: bordersNone,
  });

const rightColumn = (
  metrics: AnalysisMetrics,
  primaryColor: string,
  secondaryColor: string,
  accentColor: string,
) =>
  new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            margins: { left: 120, right: 120 },
            columnSpan: metrics.years.length + 1,
            borders: bordersNone,
            shading: { fill: primaryColor },
            children: [
              new Paragraph({
                spacing: { after: 40 },
                children: [
                  new TextRun({
                    text: 'Financial and Risk Analysis',
                    color: 'ffffff',
                    size: 24,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      ...metrics.categories
        .map((category, i) =>
          displayCategoryTable(
            category,
            primaryColor,
            secondaryColor,
            accentColor,
            i === 0,
            60,
            metrics.years,
            '($ in Millions, except EPS)',
          ),
        )
        .flat(),
    ],
    width: { size: 10700 - leftColumnWidth, type: WidthType.DXA },
    borders: bordersNone,
  });

export const financialAnalysisTable = (
  growthAndValuationAnalysisMetrics: AnalysisMetrics,
  financialAndRiskAnalysisMetrics: AnalysisMetrics,
  primaryColor: string,
  secondaryColor: string,
  accentColor: string,
  float?: ITableFloatOptions,
) => {
  return new Table({
    ...(float && { float: float }),
    width: { size: 10700, type: WidthType.DXA },
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
            children: [
              leftColumn(
                growthAndValuationAnalysisMetrics,
                primaryColor,
                secondaryColor,
                accentColor,
              ),
            ],
          }),
          new TableCell({
            children: [
              rightColumn(
                financialAndRiskAnalysisMetrics,
                primaryColor,
                secondaryColor,
                accentColor,
              ),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            margins: { left: 50, bottom: 20, right: 50, top: 20 },
            children: [
              new Paragraph({
                style: 'narrow',
                children: [new TextRun({ text: disclosure, size: 14 })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
};
