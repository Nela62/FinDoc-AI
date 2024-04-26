export enum DocumentType {
  TenK = '10-K',
  TenQ = '10-Q',
  EarningsCalls = 'Earnings Calls',
  News = 'News',
}

export type Ticker = {
  company_ticker: string;
  company_name: string;
};

export interface SECDocument extends Ticker {
  id: string;
  url: string;
  year: number;
  doc_type: string;
  quarter?: string;
}

export interface NewsArticle {
  id: string;
  url: string;
  title: string;
  author?: string;
  text?: string;
  date: string;
}

export type Document = SECDocument;
