import { JSONContent } from '@tiptap/core'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Header } from 'docx'

const getHeadingLevel = (level: number) => { 
  switch(level) {
    case 1: return HeadingLevel.HEADING_1
    case 2: return HeadingLevel.HEADING_2
    case 3: return HeadingLevel.HEADING_3
    case 4: return HeadingLevel.HEADING_4
    case 5: return HeadingLevel.HEADING_5
    case 6: return HeadingLevel.HEADING_6
    default: return HeadingLevel.HEADING_1
  }

}


export const generateDocxFile = (template: string = "ARGUS", json: JSONContent) => {
  const company = "Amazon"
  const content = json.content ?? []

  const doc = new Document({
    // TODO: add user name
    creator: "Helton Suzuki",
    // TODO: get description dynamically
    description: "Equity Research Report on " + company,
    title: "Equity Research Report - " + company,
    styles: {paragraphStyles: [{id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: {size: 32, bold: true, color: "312e81"}, paragraph: {spacing: {before: 120, after: 120}}}, {id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: {size: 20, bold: true, color: "000000", allCaps: true}, paragraph: {spacing: {before: 60, after: 60}}}]},
    sections: [
        {
        properties: { page: {margin: {top: 500, left: 900, right: 900, bottom: 300}}, column: {count: 2, space: 300}},
         headers: {
                default: new Header({
                    children: [new Paragraph("Header text")],
                }),
            },
            children: [ 
              ...content.map((cell, i) => {
                if (cell.type === "paragraph") {
                  // TODO: get all content rather than just the first one
                  return new Paragraph({ children: [new TextRun({text: ((i !== 0 && i !== 1) ? '\t': '') + (cell.content && cell.content[0]['text']) || "" , italics: cell.content && cell.content[0].marks && cell.content[0].marks[0].type === "italic", bold: cell.content && cell.content[0].marks && cell.content[0].marks[0].type === "bold"})], border: i === 0 ? {bottom: {color:'auto', space: 1, style: 'single', size: 4}} : {}}) 
                } 
                else if (cell.type === "heading") {
                  return new Paragraph({ text: (cell.content && cell.content[0]['text']) || "", heading: getHeadingLevel(cell.attrs && cell.attrs.level || 1)})
                }
                else return new Paragraph({ text: "Error" })
              }),
            ],
        },
    ],
  });
  return Packer.toBlob(doc);
}