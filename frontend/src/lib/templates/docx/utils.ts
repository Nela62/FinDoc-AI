import { JSONContent } from '@tiptap/core';
import {
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  HorizontalPositionRelativeFrom,
  IFloating,
  IImageOptions,
  ImageRun,
  LineRuleType,
  Paragraph,
  Tab,
  Table,
  TextRun,
} from 'docx';

export const getDocxContent = (json: JSONContent): Paragraph[] => {
  return json.content?.map((cell) => processCell(cell)) ?? [];
};

// TODO: add support for bullet points, images, and tables
export const processCell = (cell: JSONContent): Paragraph => {
  let paragraphContent;

  if (cell.type === 'heading') {
    if (!cell.attrs) {
      throw new Error('cell.type === heading but has no cell.attrs');
    }
    const headingLevel: number = cell.attrs.level;

    if (![1, 2, 3, 4, 5, 6].includes(headingLevel)) {
      throw new Error(`Heading level ${headingLevel} is not supported.`);
    }

    paragraphContent = new Paragraph({
      children: [new TextRun({ text: cell.content && cell.content[0].text })],
      heading:
        HeadingLevel[`HEADING_${headingLevel}` as keyof typeof HeadingLevel],
    });
  } else {
    paragraphContent = new Paragraph({
      spacing: { line: 230, lineRule: LineRuleType.AT_LEAST },
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new Tab(),
        ...(cell.content
          ?.filter((c) => c.type === 'text' && c.text)
          .map((value) => {
            return new TextRun({
              text: value.text!,
              italics: value.marks?.some((m) => m.type === 'italic'),
              bold: value.marks?.some((m) => m.type === 'bold'),
            });
          }) ?? []),
      ],
    });
  }

  if (!paragraphContent) {
    throw new Error(`The cell type ${cell.type} is currently not supported.`);
  } else {
    return paragraphContent;
  }
};

export const bordersNone = {
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

export const defaultMargins = {
  top: 2600.6,
  left: 604.8,
  right: 604.8,
  bottom: 1200,
  // header: 288,
  header: 604,
  footer: 691.2,
};

export const getImageSize = async (imageBlob: Blob) => {
  const bitmap: ImageBitmap = await createImageBitmap(imageBlob);
  const { width, height } = bitmap;
  return { width, height };
};

export const displayImage = async ({
  image,
  height,
  width,
  floating,
}: {
  image: Blob;
  height?: number;
  width?: number;
  floating?: IFloating;
}): Promise<ImageRun> => {
  const { width: visualWidth, height: visualHeight } = await getImageSize(
    image,
  );
  const buffer = await image.arrayBuffer();
  let transformation;

  if (height && width) {
    transformation = { height: height, width: width };
  } else if (height && !width) {
    transformation = {
      height: height,
      width: (height / visualHeight) * visualWidth,
    };
  } else if (!height && width) {
    transformation = {
      height: (width / visualWidth) * visualHeight,
      width: width,
    };
  } else {
    transformation = {
      height: visualHeight,
      width: visualWidth,
    };
  }

  let imgRunObject: IImageOptions = {
    data: buffer,
    transformation: transformation,
  };

  floating &&
    (imgRunObject = {
      ...imgRunObject,
      floating: floating,
    });

  return new ImageRun(imgRunObject);
};

// Archived for now
// export const splitText = (
//   json: JSONContent,
//   width: number,
//   font: CanvasTextDrawingStyles['font'],
//   maxLines: number,
// ): Paragraph[] => {
//   const canvas = document.createElement('canvas');
//   const context = canvas.getContext('2d');

//   if (!context) {
//     throw new Error('Context is missing');
//   }

//   const content = json.content;
//   context.font = font;

//   const firstHalf = [];
//   const secondHalf = [];

//   let currentLine = '';
//   let lines = 0;
//   let reachedMaxLines = false;

//   const processContent = (cell: JSONContent, last: boolean): TextRun => {
//     if (reachedMaxLines) {
//       return new TextRun({
//         text: cell.text!,
//         italics: cell.marks?.some((m) => m.type === 'italic'),
//         bold: cell.marks?.some((m) => m.type === 'bold'),
//         size: 18,
//         font: 'Times New Roman',
//       });
//     }

//     let curText = '';
//     const words = cell.text!.split(' ');

//     for (let word of words) {
//       let testLine = currentLine + word + ' ';
//       let metrics = context.measureText(testLine);
//       if (metrics.width > width && currentLine !== '') {
//         lines++;
//         // BUG: skips over a line sometimes
//         if (lines >= maxLines) {
//           firstHalfText += currentLine;
//           curText += currentLine;
//           reachedMaxLines = true;
//           currentLine = word + ' ';
//           break;
//         }
//         firstHalfText += currentLine;
//         curText += currentLine;
//         currentLine = word + ' ';
//       } else {
//         currentLine = testLine;
//       }
//     }

//     if (last && currentLine !== '') {
//       firstHalfText += currentLine;
//       curText += currentLine;
//       currentLine = '';
//       lines++;
//     }

//     let secondHalfText = cell.text!.substring(
//       curText.length + currentLine.length + 1,
//     );
//     if (secondHalfText) {
//       secondHalf.push(
//         new Paragraph({
//           alignment: AlignmentType.JUSTIFIED,
//           children: [
//             new TextRun({
//               text: secondHalfText.trim(),
//               italics: cell.marks?.some((m) => m.type === 'italic'),
//               bold: cell.marks?.some((m) => m.type === 'bold'),
//               size: 18,
//               font: 'Times New Roman',
//             }),
//           ],
//         }),
//       );
//     }

//     curText = curText.replaceAll(/\s\./g, '. ');

//     return new TextRun({
//       text: curText,
//       italics: cell.marks?.some((m) => m.type === 'italic'),
//       bold: cell.marks?.some((m) => m.type === 'bold'),
//       size: 18,
//       font: 'Times New Roman',
//     });
//   };

//   content.forEach((cell) => {
//     const paragraphContent =
//       cell.type === 'heading'
//         ? new Paragraph({
//             children: [
//               new TextRun({
//                 text: cell.content && cell.content[0].text,
//                 size: 18,
//                 font: 'Arial Narrow',
//               }),
//             ],
//             heading: getHeadingLevel(cell.attrs?.level ?? 1),
//           })
//         : new Paragraph({
//             alignment: AlignmentType.JUSTIFIED,
//             spacing: {
//               line: 80,
//               lineRule: LineRuleType.AT_LEAST,
//               before: 60,
//             },
//             children: [
//               new TextRun({
//                 text: '    ',
//                 italics: cell.marks?.some((m) => m.type === 'italic'),
//                 bold: cell.marks?.some((m) => m.type === 'bold'),
//                 size: 18,
//                 font: 'Times New Roman',
//               }),
//               ...(cell.content
//                 ?.filter((c) => c.type === 'text' && c.text)
//                 .map((c, i, arr) => processContent(c, i === arr.length - 1)) ??
//                 []),
//             ],
//           });

//     reachedMaxLines
//       ? secondHalf.push(paragraphContent)
//       : firstHalf.push(paragraphContent);
//   });

//   return [];
// };
