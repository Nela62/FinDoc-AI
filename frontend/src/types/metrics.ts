type DataPoint = {
  asOfDate: string;
  periodType: string;
  currency?: string;
  value: number;
};

export type MetricsData = {
  incomeStatement: Record<string, DataPoint[]>;
  balanceSheet: Record<string, DataPoint[]>;
  cashFlow: Record<string, DataPoint[]>;
};

type PolygonDataPoint = {
  unit: string;
  label: string;
  order: number;
  value: number;
};

type PolygonFinancials = {
  income_statement: Record<string, PolygonDataPoint>;
  balance_sheet: Record<string, PolygonDataPoint>;
  comprehensive_income: Record<string, PolygonDataPoint>;
  cash_flow_statement: Record<string, PolygonDataPoint>;
};

type PolygonEndpoint = {
  start_date: string;
  end_date: string;
  filing_date?: string;
  acceptance_datetime?: string;
  timeframe: string;
  fiscal_period: string;
  fiscal_year: string;
  cik: string;
  sic: string;
  tickers: string[];
  company_name: string;
  source_filing_url?: string;
  source_filing_file_url?: string;
  financials: PolygonFinancials;
};

export type PolygonData = PolygonEndpoint[];
