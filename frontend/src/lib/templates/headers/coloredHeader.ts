import { BorderStyle, Paragraph, TableCell, TableRow } from 'docx';
import { bordersNone } from '../docx/utils';
import { headerBase } from './base';
import { Metric } from '@/types/metrics';

export const coloredHeader = async (
  authorCompanyLogo: Blob,
  companyTicker: string,
  companyName: string,
  createdAt: Date,
  primaryColor: string,
  secondaryColor: string,
  showPageNumber: boolean,
  topBarMetrics: Metric[],
): Promise<TableRow[]> => {
  const base = await headerBase(
    primaryColor,
    companyTicker,
    companyName.toUpperCase(),
    createdAt,
    showPageNumber,
    authorCompanyLogo,
  );

  return [
    base,
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
