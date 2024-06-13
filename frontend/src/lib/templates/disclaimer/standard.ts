import {
  Header,
  HeadingLevel,
  ISectionOptions,
  Paragraph,
  SectionType,
  Table,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { bordersNone, defaultMargins } from '../docx/utils';
import { classicFooter } from '../footers/classicFooter';

const aboutFinpanel =
  "Finpanel Inc. is a provider of analytics and financial reporting solutions for finance teams. Our platform offers advanced data aggregation, report generation, and compliance features, integrating multiple functionalities into a seamless user experience. The trademarks, service marks, and logos of Finpanel Inc. are proprietary to our company. Unauthorized use, duplication, redistribution, or disclosure of this content is strictly prohibited by law and may lead to legal action.\nThe information and data provided by Finpanel are derived from sources believed to be reliable; however, their accuracy, completeness, and timeliness cannot be guaranteed. Our services do not specifically address the individual investment objectives, financial situations, or particular needs of any user. The materials provided are for informational purposes only and should not be interpreted as financial, legal, or tax advice. Users should consider seeking advice from an independent financial advisor. Investment in financial products involves risks, including the potential loss of principal.\nFinpanel Inc. is dedicated to the continuous improvement and updating of its platform, although it reserves the right to release updates and enhancements according to its discretion. Finpanel Inc. assumes no liability for any losses incurred as a result of using our services. Access to and use of Finpanel's products do not create a client-provider relationship. Finpanel Inc. operates independently and is not affiliated with any investment advisory or brokerage services.";

const finpanelResearch =
  'Finpanel uses five ratings for stocks relative to the S&P 500: BUY, OVERWEIGHT, HOLD, UNDERWEIGHT, and SELL.';

const finpanelResearchPoints = [
  'BUY: A BUY-rated stock is expected to outperform the S&P 500 on a risk-adjusted basis over a 12-month period. Finpanel Analysts set target prices, use beta as the measure of risk, and compare expected risk-adjusted stock returns to S&P 500 forecasts.',
  'OVERWEIGHT: An OVERWEIGHT-rated stock is likely to generate an above-average return compared to the S&P 500. Investors are recommended to increase their exposure to the stock in their portfolios.',
  'HOLD: A HOLD-rated stock is expected to perform in line with the S&P 500.',
  'UNDERWEIGHT: An UNDERWEIGHT-rated stock is likely to generate a below-average return compared to the S&P 500. Investors are recommended to reduce their exposure to the stock in their portfolios.',
  'SELL: A SELL-rated stock is expected to underperform the S&P 500, indicating potential declines in value. Immediate consideration for sale might be advised based on specific financial indicators or market conditions.',
];

const finpanelDisclaimer =
  "The trademarks, service marks, and logos of Finpanel Inc. are proprietary to our company. Unauthorized use, duplication, redistribution, or disclosure of this content is strictly prohibited by law and may lead to legal action.\nThe information and data provided by Finpanel are derived from sources believed to be reliable; however, their accuracy, completeness, and timeliness cannot be guaranteed. Our services do not specifically address the individual investment objectives, financial situations, or particular needs of any user. The materials provided are for informational purposes only and should not be interpreted as financial, legal, or tax advice. Users should consider seeking advice from an independent financial advisor. Investment in financial products involves risks, including the potential loss of principal.\nFinpanel Inc. is dedicated to the continuous improvement and updating of its platform, although it reserves the right to release updates and enhancements according to its discretion. Finpanel Inc. assumes no liability for any losses incurred as a result of using our services. Access to and use of Finpanel's products do not create a client-provider relationship. Finpanel Inc. operates independently and is not affiliated with any investment advisory or brokerage services.\nPast performance is not indicative of future results. All projections, estimates, and forward-looking statements are inherently uncertain and subject to change due to various factors, including market conditions, regulatory changes, and economic developments. Finpanel Inc. disclaims any obligation to update any forward-looking statements to reflect events or circumstances after the date of this material.\nThe use of Finpanel's services and data is at your own risk. Finpanel Inc. makes no warranties, expressed or implied, regarding the performance or results of our services. In no event shall Finpanel Inc. be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of the use or inability to use our services or data.";

export const DisclaimerSection = (
  disclaimerHeader: TableRow[],
  authorCompanyName: string,
  primaryColor: string,
): ISectionOptions[] => {
  return [
    {
      properties: {
        page: { margin: { ...defaultMargins, top: 1900 } },
        type: SectionType.NEXT_PAGE,
        column: { count: 2, space: 300 },
      },
      headers: {
        default: new Header({
          children: [
            new Table({
              borders: bordersNone,
              width: { size: 100.5, type: WidthType.PERCENTAGE },
              rows: disclaimerHeader,
            }),
          ],
        }),
      },
      footers: { default: classicFooter(authorCompanyName, primaryColor) },
      children: [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 0 },
          text: 'About Finpanel',
        }),
        ...aboutFinpanel.split('\n').map((p) => new Paragraph({ text: p })),
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          text: 'Finpanel Research Disclaimer',
        }),
        new Paragraph({ text: finpanelResearch }),
        ...finpanelResearchPoints.map(
          (p) =>
            new Paragraph({
              children: [new TextRun({ text: p, size: 18 })],
              // bullet: { level: 0 },
              numbering: { reference: 'disclaimer-bullets', level: 0 },
            }),
        ),
      ],
    },
    {
      properties: {
        page: { margin: defaultMargins },
        type: SectionType.CONTINUOUS,
      },
      // headers: {
      //   default: new Header({
      //     children: [
      //       new Table({
      //         borders: bordersNone,
      //         width: { size: 100.5, type: WidthType.PERCENTAGE },
      //         rows: disclaimerHeader,
      //       }),
      //     ],
      //   }),
      // },
      // footers: { default: classicFooter(authorCompanyName, primaryColor) },
      children: [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          text: 'Finpanel Disclaimer',
        }),
        ...finpanelDisclaimer
          .split('\n')
          .map((p) => new Paragraph({ text: p })),
        // new Paragraph({
        //   heading: HeadingLevel.HEADING_2,
        //   text: 'Fiinpanel Research Disclaimer',
        // }),
        // new Paragraph({ style: 'narrow', text: finpanelResearch }),
        // ...finpanelResearchPoints.map(
        //   (p) =>
        //     new Paragraph({ style: 'narrow', text: p, bullet: { level: 1 } }),
        // ),
      ],
    },
  ];
};
