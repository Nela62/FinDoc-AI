import {
  AlignmentType,
  ImageRun,
  PageNumber,
  Paragraph,
  TableCell,
  TableRow,
  TextRun,
} from 'docx';
import { bordersNone, getImageSize } from '../docx/utils';
import { format } from 'date-fns';

export const headerBase = async (
  primaryColor: string,
  companyTicker: string,
  title: string,
  createdAt: Date,
  showPageNumber: boolean,
  img: Blob,
) => {
  const { width: headerImageWidth, height: headerImageHeight } =
    await getImageSize(img);
  const buffer = await img.arrayBuffer();

  return new TableRow({
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
                text: title,
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
  });
};
