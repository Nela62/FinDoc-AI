import { FinancialStrength, Recommendation } from '@/types/report';
import { TemplateConfig } from '@/types/template';
import {
  Table,
  Document,
  LevelFormat,
  AlignmentType,
  convertInchesToTwip,
  LineRuleType,
  type ISectionOptions,
  TableRow,
  TableCell,
  Paragraph,
  BorderStyle,
  HeadingLevel,
  TextRun,
  WidthType,
  SectionType,
  Header,
  HorizontalPositionRelativeFrom,
  VerticalPositionRelativeFrom,
  Packer,
  ITableFloatOptions,
  TableAnchorType,
  RelativeHorizontalPosition,
  RelativeVerticalPosition,
} from 'docx';
import {
  bordersNone,
  defaultMargins,
  displayImage,
  getDocxContent,
  getImageSize,
} from '../utils';
import { getStandardStyles } from '../../formatting/standard';
import { SidebarMetrics } from '../../metrics/components/statistics';
import { classicFooter } from '../../footers/classicFooter';
import { coloredHeader } from '../../headers/coloredHeader';
import { format } from 'date-fns';
import { firstPageSection } from './firstPage';
import { Rating } from '../../metrics/components/ratings';
import {
  AnalysisMetrics,
  financialAnalysisTable,
} from '../../docxTables/financialAnalysisTable';

const ratingsList = [
  {
    rowName: '12-month rating',
    cells: ['SELL', 'UW', 'HOLD', 'OW', 'BUY'],
  },
  { rowName: 'Financial Strength', cells: ['LOW', 'LM', 'MED', 'MH', 'HIGH'] },
];

const recommendationMap: Record<Recommendation, string> = {
  Buy: 'BUY',
  Overweight: 'OW',
  Hold: 'HOLD',
  Underweight: 'UW',
  Sell: 'SELL',
};
const financialStrengthMap: Record<FinancialStrength, string> = {
  Low: 'LOW',
  'Low-Medium': 'LM',
  Medium: 'MED',
  'Medium-High': 'MH',
  High: 'HIGH',
};

export type EquityAnalystSidebarProps = {
  summary: string[];
  businessDescription: string;
  sidebarMetrics: SidebarMetrics;
  growthAndValuationAnalysisMetrics: AnalysisMetrics;
  financialAndRiskAnalysisMetrics: AnalysisMetrics;
  recommendation: Recommendation;
  financialStrength: FinancialStrength;
  ratings: Rating[];
  targetPrice: number;
  firstPageVisual?: Blob | Table;
  secondPageVisual?: Blob | Table;
  lastPageVisual?: Blob | Table;
};

export const equityAnalystSidebar = async ({
  content,
  colors,
  twoColumn,
  authors,
  authorCompanyName,
  authorCompanyLogo,
  createdAt,
  companyName,
  companyTicker,
  companyLogo,
  summary,
  businessDescription,
  sidebarMetrics,
  growthAndValuationAnalysisMetrics,
  financialAndRiskAnalysisMetrics,
  ratings,
  recommendation,
  financialStrength,
  targetPrice,
  firstPageVisual,
  secondPageVisual,
  lastPageVisual,
}: EquityAnalystSidebarProps & TemplateConfig): Promise<Blob> => {
  const [primaryColor, secondaryColor, accentColor] = colors;
  const mainText = getDocxContent(content);

  const header = await coloredHeader(
    authorCompanyLogo,
    companyTicker,
    companyName,
    createdAt,
    primaryColor,
    true,
  );

  const firstPageHeader = await coloredHeader(
    authorCompanyLogo,
    companyTicker,
    companyName,
    createdAt,
    primaryColor,
    false,
  );
  const firstPage: ISectionOptions = await firstPageSection(
    authorCompanyName,
    firstPageHeader,
    businessDescription,
    summary,
    authors,
    recommendation,
    firstPageVisual,
    sidebarMetrics,
    ratings,
    companyLogo,
    colors,
  );

  const float: ITableFloatOptions = {
    horizontalAnchor: 'margin',
    verticalAnchor: 'page',
    absoluteHorizontalPosition: 0,
    absoluteVerticalPosition: 9220,
    topFromText: 100,
    bottomFromText: 0,
  };

  const mainPageSection: ISectionOptions = {
    properties: {
      page: { margin: defaultMargins },
      type: SectionType.NEXT_PAGE,
      column: { count: 2, space: 300 },
    },
    headers: { default: new Header({ children: header }) },
    footers: { default: classicFooter(authorCompanyName, primaryColor) },
    children: [
      financialAnalysisTable(
        growthAndValuationAnalysisMetrics,
        financialAndRiskAnalysisMetrics,
        secondaryColor,
        accentColor,
        float,
      ),
      ...mainText,
    ],
  };
  // const disclosurePageSection: ISectionOptions = {};

  const doc = new Document({
    creator: authors[0],
    description: companyName + ' Equity Research Report',
    title: companyName + ' Equity Research Report',
    compatibility: { doNotExpandShiftReturn: true },
    styles: getStandardStyles(primaryColor),
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
    sections: [firstPage, mainPageSection],
  });
  return Packer.toBlob(doc);
};
