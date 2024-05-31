import {
  AlignmentType,
  HorizontalPositionRelativeFrom,
  ImageRun,
  PageNumber,
  Paragraph,
  TextRun,
  VerticalPositionRelativeFrom,
} from 'docx';
import { getImageSize } from '../docx/utils';
import { format } from 'date-fns';

export const coloredHeader = async (
  authorCompanyLogo: Blob,
  companyTicker: string,
  companyName: string,
  createdAt: Date,
  primaryColor: string,
): Promise<Paragraph[]> => {
  const { width: headerImageWidth, height: headerImageHeight } =
    await getImageSize(authorCompanyLogo);
  const buffer = await authorCompanyLogo.arrayBuffer();

  return [
    new Paragraph({
      children: [
        new ImageRun({
          data: buffer,
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
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: `Report created ${format(createdAt, 'MMM d, yyyy')}`,
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
      ],
    }),
  ];
};
