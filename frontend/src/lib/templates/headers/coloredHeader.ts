import {
  AlignmentType,
  BorderStyle,
  HorizontalPositionRelativeFrom,
  ImageRun,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalPositionRelativeFrom,
  WidthType,
} from 'docx';
import { bordersNone, getImageSize } from '../docx/utils';
import { format } from 'date-fns';
import { Overview } from '@/types/alphaVantageApi';

function moneyFormat(labelValue: string | number) {
  // Nine Zeroes for Billions
  return Math.abs(Number(labelValue)) >= 1.0e12
    ? (Math.abs(Number(labelValue)) / 1.0e9).toFixed(2) + ' Tril'
    : Math.abs(Number(labelValue)) >= 1.0e9
    ? (Math.abs(Number(labelValue)) / 1.0e9).toFixed(2) + ' Bil'
    : // Six Zeroes for Millions
    Math.abs(Number(labelValue)) >= 1.0e6
    ? (Math.abs(Number(labelValue)) / 1.0e6).toFixed(2) + ' Mil'
    : // Three Zeroes for Thousands
    Math.abs(Number(labelValue)) >= 1.0e3
    ? Math.abs(Number(labelValue)) / 1.0e3 + 'K'
    : Math.abs(Number(labelValue));
}

export const coloredHeader = async (
  authorCompanyLogo: Blob,
  companyTicker: string,
  companyName: string,
  createdAt: Date,
  primaryColor: string,
  secondaryColor: string,
  showPageNumber: boolean,
  overview: Overview,
  lastClosingPrice: number,
  targetPrice: number,
): Promise<TableRow[]> => {
  const { width: headerImageWidth, height: headerImageHeight } =
    await getImageSize(authorCompanyLogo);
  const buffer = await authorCompanyLogo.arrayBuffer();
  // TODO: add currency
  const topBarMetrics = [
    { title: 'Last Price', value: lastClosingPrice.toString() },
    { title: 'Target Price', value: targetPrice.toString() + ' USD' },
    {
      title: 'Price/Target',
      value: (lastClosingPrice / targetPrice).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    },
    {
      title: 'Market Cap',
      value: moneyFormat(overview.MarketCapitalization).toLocaleString(
        'en-US',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      ),
    },
    {
      title: 'EBITDA',
      value: moneyFormat(overview.EBITDA).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    },
    { title: 'Diluted EPS TTM', value: overview.DilutedEPSTTM },
    { title: 'Revenue per share TTM', value: overview.RevenuePerShareTTM },
    {
      title: 'Gross profit TTM',
      value: moneyFormat(overview.GrossProfitTTM).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    },
    { title: 'Forward PE', value: overview.ForwardPE },
    { title: 'Trailing PE', value: overview.TrailingPE },
  ];

  return [
    new TableRow({
      children: [
        new TableCell({
          verticalAlign: 'center',
          borders: bordersNone,
          columnSpan: 4,
          shading: { fill: primaryColor },
          margins: { left: 100 },
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  data: buffer,
                  transformation: {
                    width: (45 / headerImageHeight) * headerImageWidth,
                    height: 45,
                  },
                  // floating: {
                  //   zIndex: 10,
                  //   behindDocument: false,
                  //   horizontalPosition: {
                  //     relative: HorizontalPositionRelativeFrom.LEFT_MARGIN,
                  //     offset: 395548,
                  //   },
                  //   verticalPosition: {
                  //     relative: VerticalPositionRelativeFrom.TOP_MARGIN,
                  //     // offset: 351752,
                  //     offset: 442752,
                  //   },
                  // },
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          borders: bordersNone,
          margins: { right: 100 },
          columnSpan: 6,
          shading: { fill: primaryColor },
          children: [
            new Paragraph({
              shading: { fill: primaryColor },
              children: [
                new TextRun({
                  text: `NASDAQ: ${companyTicker}`,
                  size: 16,
                  color: 'ffffff',
                  font: 'Arial Narrow',
                  bold: true,
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
            new Paragraph({
              shading: { fill: primaryColor },
              children: [
                new TextRun({
                  text: companyName.toUpperCase(),
                  size: 46,
                  color: 'ffffff',
                  font: 'Arial Narrow',
                  bold: true,
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
            new Paragraph({
              shading: { fill: primaryColor },
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: `Report created ${format(createdAt, 'MMM d, yyyy')}`,
                  size: 16,
                  color: 'ffffff',
                  font: 'Arial Narrow',
                }),
                new TextRun({
                  children: showPageNumber
                    ? [
                        '  Page ',
                        PageNumber.CURRENT,
                        ' OF ',
                        PageNumber.TOTAL_PAGES,
                      ]
                    : [],
                  bold: true,
                  size: 16,
                  color: 'ffffff',
                  font: 'Arial Narrow',
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: topBarMetrics.map(
        (metric) =>
          new TableCell({
            width: { size: '10%' },
            borders: {
              ...bordersNone,
              bottom: {
                style: BorderStyle.SINGLE,
                size: 6,
                color: '000000',
              },
            },
            shading: { fill: secondaryColor },
            margins: { bottom: 100, top: 100, left: 70, right: 50 },
            children: [
              new Paragraph({ style: 'bold-narrow', text: metric.title }),
              new Paragraph({ style: 'narrow', text: metric.value }),
            ],
          }),
      ),
    }),
  ];
};
