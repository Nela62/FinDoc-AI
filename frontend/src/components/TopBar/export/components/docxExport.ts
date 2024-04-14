import { JSONContent } from '@tiptap/core';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Header,
  Footer,
  AlignmentType,
  ImageRun,
  HorizontalPositionRelativeFrom,
  VerticalPositionRelativeFrom,
  PageNumber,
  SectionType,
  Table,
  WidthType,
  TableCell,
  TableRow,
  HeightRule,
  BorderStyle,
} from 'docx';

const getHeadingLevel = (level: number) => {
  switch (level) {
    case 1:
      return HeadingLevel.HEADING_1;
    case 2:
      return HeadingLevel.HEADING_2;
    case 3:
      return HeadingLevel.HEADING_3;
    case 4:
      return HeadingLevel.HEADING_4;
    case 5:
      return HeadingLevel.HEADING_5;
    case 6:
      return HeadingLevel.HEADING_6;
    default:
      return HeadingLevel.HEADING_1;
  }
};

const TEST_METRICS = {
  'Market Overview': {
    Price: '$128.91',
    'Target Price': '$165.00',
    '52 Week Price Range': '$81.43 to $146.57',
    'Shares Outstanding': '10.26 Billion',
    Dividend: '$0.00',
  },
  'Sector Overview': {
    Sector: 'Consumer Discretionary',
    'Sector Rating': 'OVER WEIGHT',
    '% of S&P 500 Market Cap.': '10.00%',
  },
  'Financial Strength': {
    'Financial Strength Rating': 'MEDIUM-HIGH',
    'Debt/Capital Ratio': '51.5%',
    'Return on Equity': '13.0%',
    'Net Margin': '2.4%',
    'Payout Ratio': '--',
    'Current Ratio': '0.94',
    Revenue: '$538.05 Billion',
    'After-Tax Income': '$13.07 Billion',
  },
  Valuation: {
    'Current FY P/E': '57.81',
    'Prior FY P/E': '105.66',
    'Price/Sales': '2.46',
    'Price/Book': '8.56',
    'Book Value/Share': '$15.06',
    'Market Capitalization': '$1.32 Trillion',
  },
  'Forecasted Growth': {
    '1 Year EPS Growth Forecast': '82.79%',
    '5 Year EPS Growth Forecast': '11.00%',
    '1 Year Dividend Growth Forecast': 'N/A',
  },
  Risk: { Beta: '1.32', 'Institutional Ownership': '58.43%' },
};

const TEST_COMPANY_DESCRIPTION = `Amazon.com is the leading U.S. e-commerce retailer and among the top e-commerce sites globally. Amazon.com also provides Amazon Web Services (AWS), which is the global leader in cloud-based Infrastructure-as-a-Service (IaaS) platforms. The company's Prime membership platform is a key online retail differentiator, providing customers with free shipping (after an annual fee) along with exclusive media content (music, video, audible books, etc.). The company's Kindle reader and Alexa-based Echo and Dot digital voice assistants are category leaders.`;

const TEST_RECOMMENDATION = 'BUY';

export const generateDocxFile = async (
  template: string = 'ARGUS',
  json: JSONContent,
  metrics: any = TEST_METRICS,
  recommendation: string = TEST_RECOMMENDATION,
  companyDescription: string = TEST_COMPANY_DESCRIPTION,
) => {
  // TODO: use selectedCompany to fetch its full name
  const companyName = 'Amazon.com Inc';

  const content = json.content ?? [];

  const margins = {
    top: 1550.6,
    left: 604.8,
    right: 604.8,
    bottom: 878.4,
    header: 288,
    footer: 691.2,
  };

  const bordersNone = {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: {
      style: BorderStyle.NONE,
      size: 0,
      color: 'FFFFFF',
    },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: {
      style: BorderStyle.NONE,
      size: 0,
      color: 'FFFFFF',
    },
  };

  const headerImage = await fetch('/docx_header.png').then((r) => r.blob());

  const headerComponent = (pageNum: boolean = true) => [
    new Paragraph({
      children: [
        new ImageRun({
          // @ts-ignore
          data: headerImage,
          // TODO: get more precise values
          transformation: { width: 720.96, height: 64.32 },
          floating: {
            behindDocument: true,
            horizontalPosition: {
              relative: HorizontalPositionRelativeFrom.LEFT_MARGIN,
              offset: 384048,
            },
            verticalPosition: {
              relative: VerticalPositionRelativeFrom.TOP_MARGIN,
              offset: 301752,
            },
          },
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'NASDAQ: AMZN',
          size: 16,
          color: 'ffffff',
          font: 'Arial Narrow',
          bold: true,
        }),
      ],
      alignment: AlignmentType.RIGHT,
    }),
    new Paragraph({
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
      // spacing is used to ensure the table aligns properly with
      // the header on the first page
      spacing: { after: 18 },
      children: pageNum
        ? [
            new TextRun({
              text: 'Report created Apr 1, 2024',
              size: 16,
              color: 'ffffff',
              font: 'Arial Narrow',
            }),
            new TextRun({
              children: [
                '  Page ',
                PageNumber.CURRENT,
                ' OF ',
                PageNumber.TOTAL_PAGES,
              ],
              bold: true,
              size: 16,
              color: 'ffffff',
              font: 'Arial Narrow',
            }),
          ]
        : [
            new TextRun({
              text: 'Report created Apr 1, 2024',
              size: 16,
              color: 'ffffff',
              font: 'Arial Narrow',
            }),
          ],
      alignment: AlignmentType.RIGHT,
    }),
  ];

  const metricsArr = [
    ...Object.keys(metrics).map((key) => {
      return [
        new TableRow({
          children: [
            new TableCell({
              borders: bordersNone,
              shading: { fill: 'f4e9d3' },
              children: [
                new Paragraph({
                  spacing: { before: 80 },
                  children: [
                    new TextRun({
                      text: key,
                      bold: true,
                      color: '1c4587',
                      size: 18,
                      font: 'Arial Narrow',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        // using spacing instead of margins causes white lines between the rows
        // both cells have the same font size to ensure alignment but
        // it would be good to make the right cell of size 14
        ...Object.entries(metrics[key]).map(
          ([key, value], i) =>
            new TableRow({
              children: [
                new TableCell({
                  margins: { top: 20, bottom: 20 },
                  borders: {
                    ...bordersNone,
                    top: {
                      style: i === 0 ? BorderStyle.SINGLE : BorderStyle.NONE,
                      size: i === 0 ? 4 : 0,
                      color: 'a3a3a3',
                    },
                  },
                  shading: { fill: 'f4e9d3' },
                  width: { size: 54, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      // spacing: { before: 40 },
                      children: [
                        new TextRun({
                          text: key,
                          size: 16,
                          font: 'Arial Narrow',
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  margins: { top: 20, bottom: 20 },
                  borders: {
                    ...bordersNone,
                    top: {
                      style: i === 0 ? BorderStyle.SINGLE : BorderStyle.NONE,
                      size: i === 0 ? 4 : 0,
                      color: 'a3a3a3',
                    },
                  },
                  shading: { fill: 'f4e9d3' },
                  children: [
                    new Paragraph({
                      // spacing: { before: 40 },
                      alignment: AlignmentType.RIGHT,
                      children: [
                        new TextRun({
                          text: String(value),
                          size: 16,
                          bold: true,
                          font: 'Arial Narrow',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
        ),
      ];
    }),
  ];

  const keyStatisticsSidebar = [
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: 'Key Statistics',
          bold: true,
          color: '1c4587',
          size: 24,
          font: 'Arial Narrow',
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Key Statistics pricing data reflects previous trading day's closing price. Other applicable data are trailing 12-months unless otherwise specified.",
          size: 14,
          font: 'Arial Narrow',
          color: '1c4587',
        }),
      ],
    }),
    new Table({
      borders: {
        top: { style: 'none' },
        bottom: { style: 'none' },
        left: { style: 'none' },
        right: { style: 'none' },
      },
      rows: metricsArr.flat(),
    }),
  ];

  const firstPageSection = {
    properties: {
      page: {
        margin: { ...margins, top: 288 },
      },
    },
    children: [
      ...headerComponent(false),
      new Table({
        margins: { top: 60 },
        borders: {
          top: { style: 'none' },
          bottom: { style: 'none' },
          left: { style: 'none' },
          right: { style: 'none' },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: companyDescription,
                        font: 'Arial Narrow',
                        size: 18,
                      }),
                    ],
                    spacing: { after: 80, before: 40 },
                    border: {
                      bottom: {
                        style: BorderStyle.SINGLE,
                        size: 4,
                        color: '000000',
                        space: 2,
                      },
                    },
                  }),
                  new Paragraph({
                    text: "Analyst's Notes",
                    heading: HeadingLevel.HEADING_1,
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Analysis by Helton Suzuki, CFA, April 11, 2024',
                        italics: true,
                        size: 18,
                      }),
                    ],
                  }),
                  new Paragraph({
                    spacing: { after: 80, before: 40 },
                    border: {
                      bottom: {
                        style: BorderStyle.SINGLE,
                        size: 4,
                        color: 'a3a3a3',
                        space: 1,
                      },
                    },
                    children: [
                      new TextRun({
                        text: 'OUR RATING:  ',
                        size: 18,
                        bold: true,
                        font: 'Arial Narrow',
                      }),
                      new TextRun({
                        text: recommendation,
                        size: 18,
                        bold: true,
                        color: '166534',
                        font: 'Arial Narrow',
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                margins: { left: 60, right: 60 },
                shading: { fill: 'f4e9d3' },
                children: keyStatisticsSidebar,
                width: { type: WidthType.DXA, size: 3528 },
              }),
            ],
          }),
        ],
        width: { size: 101, type: WidthType.PERCENTAGE },
      }),
    ],
  };

  const doc = new Document({
    // TODO: add user name
    creator: 'Helton Suzuki',
    // TODO: get description dynamically
    description: 'Equity Research Report on ' + companyName,
    title: 'Equity Research Report - ' + companyName,
    styles: {
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 32, bold: true, color: '312e81', font: 'Arial Narrow' },
          paragraph: { spacing: { before: 120, after: 120 } },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 20, bold: true, color: '000000', allCaps: true },
          paragraph: { spacing: { before: 60, after: 60 } },
        },
      ],
    },
    sections: [
      firstPageSection,
      {
        properties: {
          page: {
            margin: margins,
          },
          type: SectionType.NEXT_PAGE,
          column: { count: 2, space: 300 },
        },
        headers: {
          default: new Header({
            children: headerComponent(),
          }),
        },
        footers: {
          // TODO: put the text in a table so that it's aligned
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Finpanel ',
                    size: 28,
                    color: '1c4587',
                    font: 'Arial Narrow',
                    bold: true,
                  }),
                  new TextRun({
                    text: 'Analyst Report',
                    size: 28,
                    color: '1c4587',
                    font: 'Arial Narrow',
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: '\n\n©2024 Finpanel Technologies Inc.',
                    size: 14,
                    color: '000000',
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...content.map((cell, i) => {
            if (cell.type === 'paragraph') {
              // TODO: get all content rather than just the first one
              return new Paragraph({
                children: [
                  new TextRun({
                    text:
                      (i !== 0 && i !== 1 ? '  ' : '') +
                        (cell.content && cell.content[0]['text']) || '',
                    italics:
                      cell.content &&
                      cell.content[0].marks &&
                      cell.content[0].marks[0].type === 'italic',
                    bold:
                      cell.content &&
                      cell.content[0].marks &&
                      cell.content[0].marks[0].type === 'bold',
                  }),
                ],
              });
            } else if (cell.type === 'heading') {
              return new Paragraph({
                text: (cell.content && cell.content[0]['text']) || '',
                heading: getHeadingLevel((cell.attrs && cell.attrs.level) || 1),
              });
            } else return new Paragraph({ text: 'Error' });
          }),
        ],
      },
    ],
  });
  return Packer.toBlob(doc);
};
