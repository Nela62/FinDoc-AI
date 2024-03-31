import { JSONContent } from '@tiptap/core'
import { Document, Packer, Paragraph, TextRun } from 'docx'


export const generateDocxFile = (template: string = "ARGUS", json_str: JSONContent) => {
  const company = "Amazon"
  const doc = new Document({
    // TODO: add user name
    creator: "Helton Suzuki",
    // TODO: get description dynamically
    description: "Equity Research Report on " + company,
    title: "Equity Research Report - " + company,
    sections: [
        {
            properties: {},
            children: [ 
                new Paragraph({
                    children: [
                        new TextRun("Hello World"),
                        new TextRun({
                            text: "Foo Bar",
                            bold: true,
                        }),
                        new TextRun({
                            text: "\tGithub is the best",
                            bold: true,
                        }),
                    ],
                }),
            ],
        },
    ],
  });
  return Packer.toBlob(doc);
}