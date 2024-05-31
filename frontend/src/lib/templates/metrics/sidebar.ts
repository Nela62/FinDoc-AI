import { FinancialStrength, Recommendation } from '@/types/report';
import {
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  HeightRule,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { bordersNone, displayImage } from '../docx/utils';
import { Rating, displayRatings } from './components/ratings';
import { SidebarMetrics, displayStatistics } from './components/statistics';

export const metricsSidebar = async (
  metrics: SidebarMetrics,
  ratings: Rating[],
  companyLogo: Blob,
  authorCompanyName: string,
  colors: string[],
) => {
  const [primaryColor, secondaryColor, accentColor] = colors;
  const logo = await displayImage({ image: companyLogo, height: 57.6 });

  return new TableCell({
    margins: { left: 120, right: 120, bottom: 120, top: 200 },
    width: { type: WidthType.DXA, size: 3528 },
    shading: { fill: secondaryColor },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          logo,
          ...displayRatings(
            authorCompanyName,
            ratings,
            primaryColor,
            secondaryColor,
            accentColor,
          ),
          ...displayStatistics(metrics, secondaryColor),
        ],
      }),
    ],
  });
};
