import moment from 'moment';
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
  LevelFormat,
  convertInchesToTwip,
  LineRuleType,
  TextWrappingType,
} from 'docx';
import { FileChild } from 'docx/build/file/file-child';
import { EARNINGS_IBM } from '@/lib/data/earnings_ibm';

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

type RatingsType = {
  '12-month': string;
  'Financial Strength': string;
};

const ratingsList = [
  {
    rowName: '12-month',
    cells: ['SELL', 'UW', 'HOLD', 'OW', 'BUY'],
  },
  { rowName: 'Financial Strength', cells: ['LOW', 'LM', 'MED', 'MH', 'HIGH'] },
];

const SUMMARY = [
  'EPS and sales beat, better outlook.',
  'Amazon reported above-consensus revenue and EPS for 2Q23 and positive guidance for 3Q23. The stock rallied as operating profit far exceeded expectations.',
  "Despite a softer post-pandemic environment for consumer online retail and global macro-economic softness, Amazon's revenue exceeded consensus by over $3 billion, while GAAP profits nearly doubled Street expectations.",
  'The AWS business, which had shown signs of deceleration, may now be energized by the global push to generative AI.',
  'Beyond current challenges, Amazon appears to have retained market-share gains that it built during the pandemic.',
  'We believe that AMZN warrants long-term accumulation in most equity accounts.',
];

const DEFAULT_COLORS = ['#1c4587', '#f4e9d3', '#006f3b'];

type DocxFileProps = {
  content: JSONContent;
  img: string;
  companyName: string;
  companyTicker: string;
  companyDescription: string;
  recommendation?: string;
  metrics?: any;
  templateId?: string;
  colors?: string[];
  authorName: string;
  authorCompanyName: string;
  targetPrice?: number;
  headerImageLink?: string;
  financialStrength: string;
  // daily_stock: any;
  // earnings: any;
};

export const generateDocxFile = async ({
  content,
  img,
  companyName,
  companyTicker,
  companyDescription = TEST_COMPANY_DESCRIPTION,
  metrics = TEST_METRICS,
  recommendation = TEST_RECOMMENDATION,
  templateId = 'ARGUS',
  colors = DEFAULT_COLORS,
  authorName,
  authorCompanyName,
  headerImageLink = '/white_coreline_logo.png',
  financialStrength,
}: // earnings = EARNINGS_IBM,
DocxFileProps) => {
  const [primaryColor, secondaryColor, accentColor] = colors;
  const ratings = {
    '12-month': recommendation === 'AUTO' ? 'BUY' : recommendation,
    'Financial Strength': financialStrength,
  };

  const firstHalf: Paragraph[] = [];
  const secondHalf: Paragraph[] = [];

  function splitText(
    content: JSONContent[],
    width: number,
    font: CanvasTextDrawingStyles['font'],
    maxLines: number,
  ) {
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    if (!context) {
      console.log('no context');
      return [];
    }
    context.font = font;

    let currentLine = '';
    let lines = 0;
    let firstHalfText = '';
    let reachedMaxLines = false;

    const processContent = (cell: JSONContent, last: boolean): TextRun => {
      if (reachedMaxLines) {
        return new TextRun({
          text: cell.text!,
          italics: cell.marks?.some((m) => m.type === 'italic'),
          bold: cell.marks?.some((m) => m.type === 'bold'),
          size: 18,
          font: 'Times New Roman',
        });
      }

      let curText = '';
      const words = cell.text!.split(' ');

      for (let word of words) {
        let testLine = currentLine + word + ' ';
        let metrics = context.measureText(testLine);
        if (metrics.width > width && currentLine !== '') {
          lines++;
          // BUG: skips over a line sometimes
          if (lines >= maxLines) {
            firstHalfText += currentLine;
            curText += currentLine;
            reachedMaxLines = true;
            currentLine = word + ' ';
            break;
          }
          firstHalfText += currentLine;
          curText += currentLine;
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      }

      if (last && currentLine !== '') {
        firstHalfText += currentLine;
        curText += currentLine;
        currentLine = '';
        lines++;
      }

      let secondHalfText = cell.text!.substring(
        curText.length + currentLine.length + 1,
      );
      if (secondHalfText) {
        secondHalf.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: secondHalfText.trim(),
                italics: cell.marks?.some((m) => m.type === 'italic'),
                bold: cell.marks?.some((m) => m.type === 'bold'),
                size: 18,
                font: 'Times New Roman',
              }),
            ],
          }),
        );
      }

      curText = curText.replaceAll(/\s\./g, '.');

      return new TextRun({
        text: curText,
        italics: cell.marks?.some((m) => m.type === 'italic'),
        bold: cell.marks?.some((m) => m.type === 'bold'),
        size: 18,
        font: 'Times New Roman',
      });
    };

    content.forEach((cell) => {
      console.log(secondHalf);
      const paragraphContent =
        cell.type === 'heading'
          ? new Paragraph({
              children: [
                new TextRun({
                  text: cell.content && cell.content[0].text,
                  size: 18,
                  font: 'Arial Narrow',
                }),
              ],
              heading: getHeadingLevel(cell.attrs?.level ?? 1),
            })
          : new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: {
                line: 80,
                lineRule: LineRuleType.AT_LEAST,
                before: 60,
              },
              children: [
                new TextRun({
                  text: '    ',
                  italics: cell.marks?.some((m) => m.type === 'italic'),
                  bold: cell.marks?.some((m) => m.type === 'bold'),
                  size: 18,
                  font: 'Times New Roman',
                }),
                ...(cell.content
                  ?.filter((c) => c.type === 'text' && c.text)
                  .map((c, i, arr) =>
                    processContent(c, i === arr.length - 1),
                  ) ?? []),
              ],
            });

      reachedMaxLines
        ? secondHalf.push(paragraphContent)
        : firstHalf.push(paragraphContent);
    });

    return [];
  }

  splitText(content.content ?? [], 480, '9px Times New Roman', 9);

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

  async function getImageSize(imageBlob: Blob) {
    const bitmap: ImageBitmap = await createImageBitmap(imageBlob);
    const { width, height } = bitmap;
    return { width, height };
  }

  const headerImage = await fetch(headerImageLink).then((r) => r.blob());
  const { width: headerImageWidth, height: headerImageHeight } =
    await getImageSize(headerImage);

  // TODO: fetch this dynamically
  const reportCompanyLogo = await fetch('/amazon-logo.png').then((r) =>
    r.blob(),
  );
  const { width: reportCompanyLogoWidth, height: reportCompanyLogoHeight } =
    await getImageSize(reportCompanyLogo);

  const tableImage = await fetch('/second_page_table.png').then((r) =>
    r.blob(),
  );
  const { width: tableImageWidth, height: tableImageHeight } =
    await getImageSize(headerImage);

  const headerComponent = (pageNum: boolean = true) => [
    new Paragraph({
      children: [
        new ImageRun({
          // @ts-ignore
          data: headerImage,
          // TODO: get more precise values
          transformation: {
            width: (50 / headerImageHeight) * headerImageWidth,
            height: 50,
          },
          floating: {
            zIndex: 10,
            behindDocument: false,
            horizontalPosition: {
              relative: HorizontalPositionRelativeFrom.LEFT_MARGIN,
              offset: 385548,
            },
            verticalPosition: {
              relative: VerticalPositionRelativeFrom.TOP_MARGIN,
              // offset: 301752,
              offset: 351752,
            },
          },
        }),
      ],
    }),
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
      children: pageNum
        ? [
            new TextRun({
              text: `Report created ${moment().format('MMM DD, YYYY')}`,
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
              text: `Report created ${moment().format('MMM DD, YYYY')}`,
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
              shading: { fill: secondaryColor },
              children: [
                new Paragraph({
                  spacing: { before: 80 },
                  children: [
                    new TextRun({
                      text: key,
                      bold: true,
                      color: primaryColor,
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
                  shading: { fill: secondaryColor },
                  width: { size: 50, type: WidthType.PERCENTAGE },
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
                  shading: { fill: secondaryColor },
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

  const ratingCell = (rowName: string, cellName: string) =>
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
        fill:
          ratings[rowName as keyof RatingsType] === cellName
            ? accentColor
            : 'dbd9d9',
      },
      width: { size: 567, type: WidthType.DXA },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          // spacing: { before: 40 },
          children: [
            new TextRun({
              text: cellName,
              size: 18,
              font: 'Arial Narrow',
              bold: true,
              color: 'ffffff',
            }),
          ],
        }),
      ],
    });

  const corelineRatingsSidebar = [
    new Paragraph({
      spacing: { after: 100, before: 100 },
      children: [
        new TextRun({
          text: `${authorCompanyName} Ratings`,
          bold: true,
          color: primaryColor,
          size: 24,
          font: 'Arial Narrow',
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
      rows: ratingsList.map(
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
                    // spacing: { before: 40 },
                    children: [
                      new TextRun({
                        text: row.rowName,
                        size: 20,
                        font: 'Arial Narrow',
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
              ...row.cells.map((cell) => ratingCell(row.rowName, cell)),
            ],
          }),
      ),
    }),
    new Paragraph({
      spacing: { before: 120, after: 50 },
      children: [
        new TextRun({
          text: `${authorCompanyName} assigns a 12-month BUY, OVERWEIGHT, HOLD, UNDERWEIGHT or SELL rating to each stock.`,
          size: 16,
          font: 'Arial Narrow',
          color: primaryColor,
        }),
      ],
    }),
    new Paragraph({
      numbering: { reference: 'sidebar-bullets', level: 0 },
      children: [
        new TextRun({
          text: 'BUY-rated stocks are expected to outperform the market (the benchmark S&P 500 Index) on a risk-adjusted basis over the next year.',
          size: 16,
          font: 'Arial Narrow',
          color: primaryColor,
        }),
      ],
    }),
    new Paragraph({
      numbering: { reference: 'sidebar-bullets', level: 0 },
      children: [
        new TextRun({
          text: 'HOLD-rated stocks are expected to perform in line with the market.',
          size: 16,
          font: 'Arial Narrow',
          color: primaryColor,
        }),
      ],
    }),
    new Paragraph({
      numbering: { reference: 'sidebar-bullets', level: 0 },
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'SELL-rated stocks are expected to underperform the market on a risk-adjusted basis.',
          size: 16,
          font: 'Arial Narrow',
          color: primaryColor,
        }),
      ],
    }),
  ];

  const keyStatisticsSidebar = [
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: '000000' } },
      spacing: { after: 40, before: 50 },
      children: [
        new TextRun({
          text: 'Key Statistics',
          bold: true,
          color: primaryColor,
          size: 24,
          font: 'Arial Narrow',
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Key Statistics pricing data reflects previous trading day's closing price. Other applicable data are trailing 12-months unless otherwise specified.",
          size: 16,
          font: 'Arial Narrow',
          color: primaryColor,
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
        margin: { ...margins, top: 290 },
      },
    },
    footers: {
      default: new Footer({
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
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text: `\n\n©2024 ${authorCompanyName}`,
                size: 14,
                color: '000000',
              }),
            ],
          }),
        ],
      }),
    },

    children: [
      ...headerComponent(false),
      new Table({
        margins: { top: 60 },
        borders: bordersNone,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: {
                  ...bordersNone,
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 4,
                    color: '000000',
                    space: 2,
                  },
                },
                margins: { right: 120 },
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
                        text: `Analysis by ${authorName}, ${moment().format(
                          'MMMM DD, YYYY',
                        )}`,
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
                  ...SUMMARY.map(
                    (point) =>
                      new Paragraph({
                        bullet: { level: 0 },
                        spacing: { before: 60 },
                        children: [
                          new TextRun({
                            text: point,
                            size: 20,
                            font: 'Arial Narrow',
                          }),
                        ],
                      }),
                  ),

                  ...firstHalf,
                  new Paragraph({
                    children: [
                      new ImageRun({
                        data: img,
                        transformation: { width: 477, height: 325 },
                        floating: {
                          horizontalPosition: {
                            relative:
                              HorizontalPositionRelativeFrom.LEFT_MARGIN,
                            offset: 0,
                          },
                          verticalPosition: {
                            relative: VerticalPositionRelativeFrom.PAGE,
                            offset: 5555000,
                          },
                        },
                      }),
                    ],
                  }),
                  new Paragraph({
                    border: {
                      top: {
                        style: BorderStyle.SINGLE,
                        size: 4,
                        color: 'a3a3a3',
                        space: 1,
                      },
                    },
                    spacing: { before: 120, after: 60 },
                    children: [
                      new TextRun({
                        text: 'Market Data  ',
                        color: '312e81',
                        size: 24,
                        font: 'Arial Narrow',
                        bold: true,
                      }),
                      new TextRun({
                        text: "Pricing reflects previous trading week's closing price",
                        color: '000000',
                        size: 14,
                        font: 'Arial Narrow',
                      }),
                    ],
                  }),
                  // new Paragraph({
                  //   alignment: AlignmentType.JUSTIFIED,
                  //   children: firstHalf,
                  //   //   [
                  //   //   new TextRun({
                  //   //     text: '',
                  //   //     size: 18,
                  //   //     font: 'Times New Roman',
                  //   //   }),
                  //   // ],
                  // }),
                ],
              }),
              new TableCell({
                borders: {
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 4,
                    color: '000000',
                    space: 2,
                  },
                },
                margins: { left: 120, right: 120, bottom: 120 },
                width: { type: WidthType.DXA, size: 3528 },
                shading: { fill: secondaryColor },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new ImageRun({
                        // @ts-ignore
                        data: reportCompanyLogo,
                        transformation: {
                          height: 57.6,
                          width:
                            (57.6 / reportCompanyLogoHeight) *
                            reportCompanyLogoWidth,
                        },
                      }),
                    ],
                  }),
                  ...corelineRatingsSidebar,
                  ...keyStatisticsSidebar,
                ],
              }),
            ],
          }),
        ],
        width: { size: 100.5, type: WidthType.PERCENTAGE },
      }),
    ],
  };

  const doc = new Document({
    // TODO: add user name
    creator: 'Helton Suzuki',
    // TODO: get description dynamically
    description: 'Equity Research Report on ' + companyName,
    title: 'Equity Research Report - ' + companyName,
    compatibility: { doNotExpandShiftReturn: true },
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
          run: { size: 24, bold: true, color: '312e81', font: 'Arial Narrow' },
          paragraph: { spacing: { before: 120, after: 60 } },
        },
        {
          id: '3',
          name: 'Heading 3',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 20, bold: true, color: '000000', allCaps: true },
          paragraph: { spacing: { before: 60, after: 60 } },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: 'sidebar-bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '\u2022',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: convertInchesToTwip(0.2),
                    hanging: convertInchesToTwip(0.1),
                  },
                },
                run: { color: primaryColor },
              },
            },
          ],
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
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: `\n\n©2024 ${authorCompanyName}`,
                    size: 14,
                    color: '000000',
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            children: [
              new ImageRun({
                // @ts-ignore
                data: tableImage,
                transformation: {
                  width: 710,
                  height: (tableImageWidth / 710) * tableImageHeight,
                },
                floating: {
                  wrap: { type: TextWrappingType.TOP_AND_BOTTOM },
                  horizontalPosition: {
                    relative: HorizontalPositionRelativeFrom.LEFT_MARGIN,
                    offset: 385548,
                  },
                  verticalPosition: {
                    relative: VerticalPositionRelativeFrom.PAGE,
                    offset: 4155000,
                  },
                },
              }),
            ],
          }),
          ...secondHalf,
        ],
      },
    ],
  });
  return Packer.toBlob(doc);
};
