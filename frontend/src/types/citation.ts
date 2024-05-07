export type PDFCitation = {
  id: string;
  node_id: string;
  text: string;
  page: number;
  doc_id: string;
  citation_snippet_id: string;
};

type apiProviders = 'Alpha Vantage';

type APICitation = {
  apiProvider: apiProviders;
  usedJsonData: string;
  originalJsonData: string;
  lastRefreshed: Date;
  endpoint: string;
  params: string;
  cacheId: string;
};

type TickerSentiment = {
  ticker: string;
  relevance_score: number;
  ticker_sentiment_score: number;
  ticker_sentiment_label: string;
};

type NewsCitation = {
  url: string;
  text: string;
  title: string;
  author: string | null;
  published_at: Date;
  last_access: Date;
  overall_sentiment_score: number;
  overall_sentiment_label: string;
  ticker_sentiment: TickerSentiment[];
};

export type CitationType = 'PDF' | 'API' | 'NEWS';

export type CitedDocument = {
  id: string;
  sourceNum: number;
  topTitle: string;
  bottomTitle: string;
  citationType: CitationType;
  lastRefreshed: Date;
  docId: string | null;
};

export type CitationSnippet = {
  id: string;
  citedDocumentId: string;
  sourceNum: number;
  title: string;
  textSnippet: string;
  // status: 'Approved' | 'Rejected' | 'Pending'
};
