import { LineRuleType, type IStylesOptions } from 'docx';

export const getStandardStyles = (primaryColor: string): IStylesOptions => ({
  default: {
    title: {
      run: {
        size: 32,
        bold: true,
        color: primaryColor,
        font: 'Arial Narrow',
      },
      paragraph: { spacing: { before: 120, after: 120 } },
    },
    heading1: {
      run: {
        size: 24,
        bold: true,
        color: primaryColor,
        font: 'Arial Narrow',
      },
      paragraph: { spacing: { before: 120, after: 60 } },
    },
    heading2: {
      run: {
        size: 18,
        bold: true,
        color: '000000',
        allCaps: true,
        font: 'Arial Narrow',
      },
      paragraph: { spacing: { before: 60, after: 40 } },
    },
    heading3: {
      run: {
        size: 18,
        bold: true,
        color: primaryColor,
        font: 'Arial Narrow',
      },
      paragraph: { spacing: { before: 80 } },
    },
  },
  paragraphStyles: [
    {
      id: 'normal',
      name: 'Normal',
      quickFormat: true,
      run: { size: 18, color: '000000', font: 'Times New Roman' },
      paragraph: {
        spacing: {
          line: 80,
          lineRule: LineRuleType.AT_LEAST,
          before: 60,
        },
      },
    },
    {
      id: 'subtitle',
      name: 'Subtitle',
      quickFormat: true,
      run: {
        size: 18,
        color: '000000',
        font: 'Times New Roman',
        italics: true,
      },
      // paragraph: {
      //   spacing: {
      //     line: 80,
      //     lineRule: LineRuleType.AT_LEAST,
      //     before: 60,
      //   },
      // },
    },
    {
      id: 'narrow',
      name: 'Narrow',
      quickFormat: true,
      run: { size: 18, color: '000000', font: 'Arial Narrow' },
    },
    {
      id: 'sidebar-narrow',
      name: 'Sidebar Narrow',
      quickFormat: true,
      run: { size: 16, color: primaryColor, font: 'Arial Narrow' },
      paragraph: { spacing: { after: 40, before: 50 } },
    },
    {
      id: 'small-narrow',
      name: 'Small Narrow',
      quickFormat: true,
      run: { size: 16, color: '000000', font: 'Arial Narrow' },
    },
    {
      id: 'bold-narrow',
      name: 'Bold Narrow',
      quickFormat: true,
      run: { size: 16, color: '000000', font: 'Arial Narrow', bold: true },
    },
  ],
});
