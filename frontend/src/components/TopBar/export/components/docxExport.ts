import { JSONContent } from '@tiptap/core';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Header,
  AlignmentType,
  ImageRun,
  HorizontalPositionRelativeFrom,
  VerticalPositionRelativeFrom,
  PageNumber,
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

async function fetchImage(url: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    return uint8Array;
  } catch (error) {
    console.error('Error:', error);
    return '';
  }
}

export const generateDocxFile = async (
  template: string = 'ARGUS',
  json: JSONContent,
) => {
  const companyName = 'Amazon.com Inc.';
  const content = json.content ?? [];

  const headerImage = await fetchImage('docx_header.png');

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
          run: { size: 32, bold: true, color: '312e81' },
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
      {
        properties: {
          page: {
            margin: {
              top: 100,
              left: 900,
              right: 900,
              bottom: 300,
              header: 100,
            },
          },
          column: { count: 2, space: 300 },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: headerImage,
                    // TODO: get more precise values
                    transformation: { width: 680, height: 80 },
                    floating: {
                      behindDocument: true,
                      horizontalPosition: {
                        relative: HorizontalPositionRelativeFrom.LEFT_MARGIN,
                        offset: 600000,
                      },
                      verticalPosition: {
                        relative: VerticalPositionRelativeFrom.TOP_MARGIN,
                        offset: 400000,
                      },
                    },
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'NASDAQ: AMZN',
                    size: 20,
                    color: 'ffffff',
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: companyName,
                    size: 50,
                    color: 'ffffff',
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Report created Apr 1, 2024',
                    size: 18,
                    color: 'ffffff',
                  }),
                  new TextRun({
                    children: [
                      '\tPage ',
                      PageNumber.CURRENT,
                      ' of ',
                      PageNumber.TOTAL_PAGES,
                    ],
                    bold: true,
                    size: 18,
                    color: 'ffffff',
                  }),
                ],
                alignment: AlignmentType.RIGHT,
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
