import { JSONContent } from '@tiptap/core';

export type ColorScheme = {
  id: string;
  colors: string[];
};

type EquityAnalystTemplate = {
  reportType: 'Equity Analyst Report';
  summary: string;
  businessDescription: string;
};

export type Template = {
  id: string;
  name: string;
  colorSchemes: ColorScheme[];
  sampleText: string;
  sampleMetrics: any;
} & EquityAnalystTemplate;

export type TemplateConfig = {
  content: JSONContent;
  colors: string[];
  twoColumn: boolean;
  authors: string[];
  authorCompanyName: string;
  authorCompanyLogo: Blob;
  createdAt: Date;
  companyName: string;
  companyTicker: string;
  companyLogo: Blob;
};
