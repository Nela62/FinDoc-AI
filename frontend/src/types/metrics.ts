type DataPoint = Record<string, number>;

export type MetricsData = {
  incomeStatement: DataPoint[];
  balanceSheet: DataPoint[];
  cashFlow: DataPoint[];
};
