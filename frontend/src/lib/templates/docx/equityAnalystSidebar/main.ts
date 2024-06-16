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
  WidthType,
  SectionType,
  Header,
  Packer,
  ITableFloatOptions,
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
import { disclaimerHeader } from '../../headers/disclaimerHeader';
import { format } from 'date-fns';
import { firstPageSection } from './firstPage';
import { Rating } from '../../metrics/components/ratings';
import {
  AnalysisMetrics,
  financialAnalysisTable,
} from '../../docxTables/financialAnalysisTable';
import { Overview } from '@/types/alphaVantageApi';
import { DisclaimerSection } from '../../disclaimer/standard';
import { TopBarMetric } from '@/lib/utils/financialAPI';
import { sourcesHeader } from '../../headers/sourcesHeader';
import { SourcesSection } from '../../sources/standard';
import { topHeaderLine } from '../../headers/base';

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
  topBarMetrics: TopBarMetric[];
  sidebarMetrics: SidebarMetrics;
  growthAndValuationAnalysisMetrics: AnalysisMetrics;
  financialAndRiskAnalysisMetrics: AnalysisMetrics;
  recommendation: Recommendation;
  financialStrength: FinancialStrength;
  ratings: Rating[];
  targetPrice: number;
  sources: string[];
  bottomFirstPageVisual: Blob;
  topFirstPageVisual: Blob;
  topHeaderText: string;
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
  topBarMetrics,
  sidebarMetrics,
  growthAndValuationAnalysisMetrics,
  financialAndRiskAnalysisMetrics,
  ratings,
  recommendation,
  financialStrength,
  targetPrice,
  bottomFirstPageVisual,
  topFirstPageVisual,
  sources,
  topHeaderText,
}: EquityAnalystSidebarProps & TemplateConfig): Promise<Blob> => {
  const [primaryColor, secondaryColor, accentColor] = colors;
  const mainText = getDocxContent(content);

  const header = await coloredHeader(
    authorCompanyLogo,
    companyTicker,
    companyName,
    createdAt,
    primaryColor,
    secondaryColor,
    true,
    topBarMetrics,
  );

  const firstPageHeader = await coloredHeader(
    authorCompanyLogo,
    companyTicker,
    companyName,
    createdAt,
    primaryColor,
    secondaryColor,
    false,
    topBarMetrics,
  );

  const displayDisclaimerHeader = await disclaimerHeader(
    authorCompanyLogo,
    companyTicker,
    createdAt,
    primaryColor,
  );

  const displaySourcesHeader = await sourcesHeader(
    authorCompanyLogo,
    companyTicker,
    createdAt,
    primaryColor,
  );

  const sourcesSection = SourcesSection(
    displaySourcesHeader,
    primaryColor,
    authorCompanyName,
    sources,
  );

  const disclaimerSection = DisclaimerSection(
    displayDisclaimerHeader,
    authorCompanyName,
    primaryColor,
  );

  const firstPage: ISectionOptions = await firstPageSection(
    authorCompanyName,
    firstPageHeader,
    businessDescription,
    summary,
    authors,
    recommendation,
    sidebarMetrics,
    ratings,
    companyLogo,
    colors,
    bottomFirstPageVisual,
    topFirstPageVisual,
    topHeaderText,
  );

  const float: ITableFloatOptions = {
    horizontalAnchor: 'margin',
    verticalAnchor: 'page',
    absoluteHorizontalPosition: 0,
    // absoluteVerticalPosition: 9220,
    absoluteVerticalPosition: 9270,
    topFromText: 100,
    bottomFromText: 0,
  };

  const mainPageSection: ISectionOptions = {
    properties: {
      page: { margin: defaultMargins },
      type: SectionType.NEXT_PAGE,
      column: { count: 2, space: 300 },
    },
    headers: {
      default: new Header({
        children: [
          new Table({
            borders: bordersNone,
            width: { size: 100.5, type: WidthType.PERCENTAGE },
            rows: [topHeaderLine(topHeaderText), ...header],
          }),
        ],
      }),
    },
    footers: { default: classicFooter(authorCompanyName, primaryColor) },
    children: [
      financialAnalysisTable(
        growthAndValuationAnalysisMetrics,
        financialAndRiskAnalysisMetrics,
        primaryColor,
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
        {
          reference: 'disclaimer-bullets',
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
                run: { color: '000000', size: 18 },
              },
            },
          ],
        },
      ],
    },
    sections: [
      firstPage,
      mainPageSection,
      sourcesSection,
      ...disclaimerSection,
    ],
  });
  return Packer.toBlob(doc);
};
