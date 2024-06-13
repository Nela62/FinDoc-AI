import { eachDayOfInterval, format, max, sub } from 'date-fns';
import { TypedSupabaseClient } from '@/types/supabase';
import { fetchAPICacheByEndpoint } from '../queries';
import {
  BalanceSheet,
  Cashflow,
  DailyStockData,
  DailyStockDataPoint,
  Earnings,
  IncomeStatement,
  Overview,
} from '@/types/alphaVantageApi';
import { SidebarMetrics } from '../templates/metrics/components/statistics';
import { AnalysisMetrics } from '../templates/docxTables/financialAnalysisTable';

function removeApiKey(url: string) {
  const parsedUrl = new URL(url);
  parsedUrl.searchParams.delete('apikey');
  return parsedUrl.toString();
}

async function fetchAndCache(
  insertCache: any,
  reportId: string,
  userId: string,
  endpoint: string,
) {
  try {
    const res = await fetch('https://www.alphavantage.co/' + endpoint);
    const json = await res.json();
    await insertCache({
      report_id: reportId,
      user_id: userId,
      json_data: json,
      endpoint: removeApiKey('https://www.alphavantage.co/' + endpoint),
      api_provider: 'alpha_vantage',
    });
    return json;
  } catch (err) {
    console.log(err);
  }
}

export async function fetchNews(
  client: TypedSupabaseClient,
  insertCache: any,
  reportId: string,
  userId: string,
  symbol: string,
  timeFrom: string,
  timeTo: string,
) {
  // 20240312T0000
  const endpoint = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}&time_from=${timeFrom}&time_to=${timeTo}&sort=RELEVANCE&limit=15`;

  const { data } = await fetchAPICacheByEndpoint(
    client,
    reportId,
    endpoint,
    'alpha_vantage',
  );

  if (!data) return;

  if (data.length === 0) {
    return await fetchAndCache(insertCache, reportId, userId, endpoint);
  } else {
    // return json
    return data[0].json_data;
  }
}

export async function fetchDailyStock(
  client: TypedSupabaseClient,
  insertCache: any,
  reportId: string,
  userId: string,
  symbol: string,
) {
  const endpoint = `query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}&outputsize=full`;

  const { data } = await fetchAPICacheByEndpoint(
    client,
    reportId,
    endpoint,
    'alpha_vantage',
  );

  if (!data) return;

  if (data.length === 0) {
    return await fetchAndCache(insertCache, reportId, userId, endpoint);
  } else {
    // return json
    return data[0].json_data;
  }
}

export async function fetchAVEndpoint(
  client: TypedSupabaseClient,
  insertCache: any,
  reportId: string,
  userId: string,
  fn: string,
  symbol: string,
) {
  const endpoint = `query?function=${fn}&symbol=${symbol}&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}`;

  const { data } = await fetchAPICacheByEndpoint(
    client,
    reportId,
    endpoint,
    'alpha_vantage',
  );

  if (!data) return;

  if (data.length === 0) {
    return await fetchAndCache(insertCache, reportId, userId, endpoint);
  } else {
    // return json
    return data[0].json_data;
  }
}

export const getNWeeksStock = (
  dailyStock: DailyStockData,
  weeks: number = 52,
  start: Date = new Date(),
) => {
  const data = dailyStock['Time Series (Daily)'];
  const nWeeksAgo = sub(start, { weeks: weeks });
  const days = eachDayOfInterval({ start: nWeeksAgo, end: new Date() });
  const stockData: DailyStockDataPoint[] = [];

  days.forEach((day) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    if (data.hasOwnProperty(formattedDay)) {
      stockData.push({ day: formattedDay, data: data[formattedDay] });
    }
  });

  return stockData;
};

export const getNYearsStock = (
  dailyStock: DailyStockData,
  years: number = 1,
  start: Date = new Date(),
) => {
  const data = dailyStock['Time Series (Daily)'];
  const nYearsAgo = sub(start, { years: years });
  const days = eachDayOfInterval({ start: nYearsAgo, end: new Date() });
  const stockData: DailyStockDataPoint[] = [];

  days.forEach((day) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    if (data.hasOwnProperty(formattedDay)) {
      stockData.push({ day: formattedDay, data: data[formattedDay] });
    }
  });

  return stockData;
};

export const getLatestStockDataPoint = (stockData: DailyStockDataPoint[]) => {
  return stockData[stockData.length - 1];
};

export const getHighestClosingStockPrice = (
  stockData: DailyStockDataPoint[],
) => {
  const closingValues = stockData.map((value) =>
    Number(value.data['4. close']),
  );
  return Math.max(...closingValues);
};

export const getLowestClosingStockPrice = (
  stockData: DailyStockDataPoint[],
) => {
  const closingValues = stockData.map((value) =>
    Number(value.data['4. close']),
  );
  return Math.min(...closingValues);
};

export const getMeanClosingStockPrice = (stockData: DailyStockDataPoint[]) => {
  const sum = stockData.reduce(
    (acc, cur) => acc + Number(cur.data['4. close']),
    0,
  );
  return (sum / stockData.length).toFixed(2);
};

export const getAverageDailyVolume = (stockData: DailyStockDataPoint[]) => {
  // For 20 trading days
  const volumeValues = stockData.map((value) =>
    Number(value.data['5. volume']),
  );
  const sum = volumeValues.slice(0, 20).reduce((acc, cur) => acc + cur, 0);
  return sum / 20;
};

function moneyFormat(labelValue: string | number) {
  // Nine Zeroes for Billions
  return Math.abs(Number(labelValue)) >= 1.0e9
    ? (Math.abs(Number(labelValue)) / 1.0e9).toFixed(2) + ' Billion'
    : // Six Zeroes for Millions
    Math.abs(Number(labelValue)) >= 1.0e6
    ? (Math.abs(Number(labelValue)) / 1.0e6).toFixed(2) + ' Million'
    : // Three Zeroes for Thousands
    Math.abs(Number(labelValue)) >= 1.0e3
    ? Math.abs(Number(labelValue)) / 1.0e3 + 'K'
    : Math.abs(Number(labelValue));
}

const getDebtCapitalRatio = (balanceSheet: BalanceSheet) =>
  Number(balanceSheet.annualReports[0].shortLongTermDebtTotal) /
  (Number(balanceSheet.annualReports[0].shortLongTermDebtTotal) +
    Number(balanceSheet.annualReports[0].totalShareholderEquity));

const getNetMargin = (incomeStatement: IncomeStatement) =>
  Number(incomeStatement.annualReports[0].netIncome) /
  Number(incomeStatement.annualReports[0].totalRevenue);

const getPayoutRatio = (overview: Overview) =>
  Number(overview.DividendPerShare) / Number(overview.EPS);

const getCurrentRatio = (balanceSheet: BalanceSheet) =>
  Number(balanceSheet.annualReports[0].totalCurrentAssets) /
  Number(balanceSheet.annualReports[0].totalCurrentLiabilities);

const getCurrentFYPE = (overview: Overview, stockData: DailyStockDataPoint[]) =>
  Number(stockData[0].data['4. close']) / Number(overview.EPS);

const getPriceSales = (overview: Overview) =>
  Number(overview.MarketCapitalization) / Number(overview.RevenueTTM);

const getPriceBooks = (overview: Overview, balanceSheet: BalanceSheet) =>
  Number(overview.MarketCapitalization) /
  (Number(balanceSheet.annualReports[0].totalAssets) -
    Number(balanceSheet.annualReports[0].totalLiabilities));

const getBookValueShare = (overview: Overview, balanceSheet: BalanceSheet) =>
  Number(balanceSheet.annualReports[0].totalShareholderEquity) /
  Number(overview.SharesOutstanding);

function capitalizeWords(str: string) {
  return str
    .toLowerCase()
    .split(' ')
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export const getSidebarMetrics = (
  overview: Overview,
  balanceSheet: BalanceSheet,
  incomeStatement: IncomeStatement,
  stockData: DailyStockDataPoint[],
  targetPrice: number,
  financialStrengthRating: string,
): SidebarMetrics => {
  const marketOverview = {
    Price: '$' + getLatestStockDataPoint(stockData)?.data['4. close'],
    'Target Price': '$' + targetPrice,
    '52 Week Price Range': `$${getLowestClosingStockPrice(
      stockData,
    )} to $${getHighestClosingStockPrice(stockData)}`,
    'Shares Outstanding': moneyFormat(
      Number(overview.SharesOutstanding).toFixed(2),
    ),
    Dividend:
      overview.DividendPerShare === 'None'
        ? 0
        : '$' + overview.DividendPerShare,
    'Dividend Yield': overview.DividendYield,
    'Average Daily Volume': moneyFormat(
      getAverageDailyVolume(stockData).toFixed(2),
    ),
  };

  const sectorOverview = {
    Sector: capitalizeWords(overview.Sector),
    Industry: capitalizeWords(overview.Industry),
  };

  const financialStrength = {
    'Financial Strength Rating': financialStrengthRating,
    'Debt/Capital Ratio': `${(getDebtCapitalRatio(balanceSheet) * 100).toFixed(
      2,
    )}%`,
    'Return on Equity':
      (Number(overview.ReturnOnEquityTTM) * 100).toFixed(2) + '%',
    'Net Margin': `${(getNetMargin(incomeStatement) * 100).toFixed(2)}%`,
    'Payout Ratio':
      overview.DividendPerShare === 'None'
        ? 0
        : getPayoutRatio(overview).toFixed(2),
    'Current Ratio': getCurrentRatio(balanceSheet).toFixed(2),
    Revenue: '$' + moneyFormat(Number(overview.RevenueTTM)),
    'After-Tax Income':
      '$' + moneyFormat(Number(incomeStatement.annualReports[0].netIncome)),
    EPS: overview.EPS,
    'Book Value': overview.BookValue,
  };

  // TODO: add prior fy p/e
  const valuation = {
    'Current FY P/E': getCurrentFYPE(overview, stockData).toFixed(2),
    'Price/Sales': getPriceSales(overview).toFixed(2),
    'Price/Book': getPriceBooks(overview, balanceSheet).toFixed(2),
    'Book Value/Share': getBookValueShare(overview, balanceSheet).toFixed(2),
  };

  const forecastedGrowth = {
    '1 Year EPS Growth Forecast': '--',
    '5 Year EPS Growth Forecast': '--',
    '1 Year Dividend Growth Forecast': '--',
  };

  const risk = {
    Beta: overview.Beta,
  };

  return {
    'Market Overview': marketOverview,
    'Sector Overview': sectorOverview,
    'Financial Strength': financialStrength,
    Valuation: valuation,
    'Forecasted Growth': forecastedGrowth,
    Risk: risk,
  };
};

const divideByMillion = (num: number | string) =>
  num === 'None'
    ? '--'
    : (Number(num) / 1.0e6).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });

export const getGrowthAndValuationAnalysisMetrics = (
  balanceSheet: BalanceSheet,
  cashflow: Cashflow,
  incomeStatement: IncomeStatement,
  earnings: Earnings,
  stockData: DailyStockData,
): AnalysisMetrics => {
  const curY = new Date().getFullYear();
  const years =
    incomeStatement.annualReports.length > 5
      ? 5
      : incomeStatement.annualReports.length;

  return {
    years: [...Array(years).keys()].map((_, i) => curY - i).reverse(),
    categories: [
      {
        name: 'Growth Analysis',
        statistics: [
          {
            name: 'Revenue',
            numbers: incomeStatement.annualReports
              .slice(0, years)
              .map((y) => divideByMillion(y.totalRevenue)),
          },
          {
            name: 'COGS',
            numbers: incomeStatement.annualReports
              .slice(0, years)
              .map((y) => divideByMillion(y.costofGoodsAndServicesSold)),
          },
          {
            name: 'Gross Profit',
            numbers: incomeStatement.annualReports
              .slice(0, years)
              .map((y) => divideByMillion(y.grossProfit)),
          },
          {
            name: 'SG&A',
            numbers: incomeStatement.annualReports
              .slice(0, years)
              .map((y) => divideByMillion(y.sellingGeneralAndAdministrative)),
          },
          {
            name: 'R&D',
            numbers: incomeStatement.annualReports
              .slice(0, years)
              .map((y) => divideByMillion(y.researchAndDevelopment)),
          },
          {
            name: 'Operating Income',
            numbers: incomeStatement.annualReports
              .slice(0, years)
              .map((y) => divideByMillion(y.operatingIncome)),
          },
          {
            name: 'Interest Expense',
            numbers: incomeStatement.annualReports
              .slice(0, years)
              .map((y) => divideByMillion(y.interestExpense)),
          },
          {
            name: 'Pretax Income',
            numbers: incomeStatement.annualReports
              .slice(0, years)
              .map((y) => divideByMillion(y.incomeBeforeTax)),
          },
          {
            name: 'Income Taxes',
            numbers: incomeStatement.annualReports
              .slice(0, years)
              .map((y) => divideByMillion(y.incomeTaxExpense)),
          },
          {
            name: 'Tax Rate (%)',
            numbers: incomeStatement.annualReports
              .slice(0, years)
              .map((y) =>
                (
                  Number(y.incomeTaxExpense) / Number(y.incomeBeforeTax)
                ).toFixed(2),
              ),
          },
          {
            name: 'Net Income',
            numbers: incomeStatement.annualReports
              .slice(0, years)
              .map((y) => divideByMillion(y.netIncome)),
          },
          {
            name: 'Common Shares Outstanding',
            numbers: balanceSheet.annualReports
              .slice(0, years)
              .map((y) => divideByMillion(y.commonStockSharesOutstanding)),
          },
          {
            name: 'EPS',
            numbers: earnings.annualEarnings
              .slice(0, years)
              .map((y) => y.reportedEPS),
          },
          {
            name: 'Dividend',
            numbers: cashflow.annualReports
              .slice(0, years)
              .map((y) => divideByMillion(y.dividendPayoutCommonStock)),
          },
        ],
      },
      {
        name: 'Growth Rates (%)',
        statistics: [
          {
            name: 'Revenue',
            numbers: incomeStatement.annualReports
              .slice(0, years === 5 ? years : years - 1)
              .map((_, i) =>
                (
                  (Number(incomeStatement.annualReports[i].totalRevenue) -
                    Number(incomeStatement.annualReports[i + 1].totalRevenue)) /
                  Number(incomeStatement.annualReports[i].totalRevenue)
                ).toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }),
              ),
          },
          {
            name: 'Operating Income',
            numbers: incomeStatement.annualReports
              .slice(0, years === 5 ? years : years - 1)
              .map((_, i) =>
                (
                  (Number(incomeStatement.annualReports[i].operatingIncome) -
                    Number(
                      incomeStatement.annualReports[i + 1].operatingIncome,
                    )) /
                  Number(incomeStatement.annualReports[i].operatingIncome)
                ).toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }),
              ),
          },
          {
            name: 'Net Income',
            numbers: incomeStatement.annualReports
              .slice(0, years === 5 ? years : years - 1)
              .map((_, i) =>
                (
                  (Number(incomeStatement.annualReports[i].netIncome) -
                    Number(incomeStatement.annualReports[i + 1].netIncome)) /
                  Number(incomeStatement.annualReports[i].netIncome)
                ).toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }),
              ),
          },
          {
            name: 'EPS',
            numbers: earnings.annualEarnings
              .slice(0, years === 5 ? years : years - 1)
              .map((_, i) =>
                (
                  (Number(earnings.annualEarnings[i].reportedEPS) -
                    Number(earnings.annualEarnings[i + 1].reportedEPS)) /
                  Number(earnings.annualEarnings[i].reportedEPS)
                ).toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }),
              ),
          },
          {
            name: 'Dividend',
            numbers: cashflow.annualReports
              .slice(0, years === 5 ? years : years - 1)
              .map((_, i) =>
                (
                  (Number(cashflow.annualReports[i].dividendPayout) -
                    Number(cashflow.annualReports[i + 1].dividendPayout)) /
                  Number(cashflow.annualReports[i].dividendPayout)
                ).toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }),
              ),
          },
          {
            name: 'Sustainable Growth Rate',
            numbers: incomeStatement.annualReports
              .slice(0, years === 5 ? years : years - 1)
              .map((y, i) =>
                (
                  (Number(y.incomeTaxExpense) /
                    Number(
                      balanceSheet.annualReports[i].totalShareholderEquity,
                    )) *
                  (1 -
                    Number(cashflow.annualReports[i].dividendPayout) /
                      Number(y.netIncome))
                ).toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }),
              ),
          },
        ],
      },
      {
        name: 'Valuation Analysis',
        statistics: [
          {
            name: 'Price: High',
            numbers: [...Array(years).keys()]
              .map(
                (_, i) =>
                  '$' +
                  getHighestClosingStockPrice(
                    getNWeeksStock(
                      stockData,
                      52,
                      sub(new Date(), { years: i }),
                    ),
                  ),
              )
              .reverse(),
          },
          {
            name: 'Price: Low',
            numbers: [...Array(years).keys()]
              .map(
                (_, i) =>
                  '$' +
                  getLowestClosingStockPrice(
                    getNWeeksStock(
                      stockData,
                      52,
                      sub(new Date(), { years: i }),
                    ),
                  ),
              )
              .reverse(),
          },
          // TODO: calculate
          {
            name: 'Price/Sales: High-Low',
            numbers: [
              '4.4 - 2.5',
              '3.7 - 2.6',
              '4.7 - 2.1',
              '4.1 - 3.2',
              '3.4 - 1.6',
            ],
          },
          {
            name: 'P/E: High-Low',
            numbers: [
              // '101.8 - 58.1',
              // '88.5 - 63.5',
              // '84.9 - 38.9',
              // '58.2 - 44.5',
              '101.8',
              '88.5',
              '84.9',
              '58.2',
              '--',
            ],
          },
          {
            name: 'Price/Cash Flow: High-Low',
            numbers: [
              // '38.4 - 21.9',
              // '28.9 - 20.8',
              // '32.7 - 15.0',
              // '35.5 - 27.1',
              // '44.2 - 21.0',
              '38.4',
              '28.9',
              '32.7',
              '35.5',
              '44.2',
            ],
          },
        ],
      },
    ],
  };
};

export const getFinancialAndRiskAnalysisMetrics = (
  balanceSheet: BalanceSheet,
  cashflow: Cashflow,
  incomeStatement: IncomeStatement,
): AnalysisMetrics => {
  const curY = new Date().getFullYear();
  const years =
    incomeStatement.annualReports.length > 3
      ? 3
      : incomeStatement.annualReports.length;

  return {
    years: [...Array(years).keys()].map((_, i) => curY - i).reverse(),
    categories: [
      {
        name: 'Cash',
        statistics: [
          {
            name: 'Cash ($ in Millions)',
            numbers: balanceSheet.annualReports
              .slice(0, years)
              .map((y) =>
                divideByMillion(y.cashAndCashEquivalentsAtCarryingValue),
              ),
          },
          {
            name: 'Working Capital ($ in Millions)',
            numbers: balanceSheet.annualReports
              .slice(0, years)
              .map((y) =>
                divideByMillion(
                  Number(y.totalCurrentAssets) -
                    Number(y.totalCurrentLiabilities),
                ),
              ),
          },
          {
            name: 'Current Ratio',
            numbers: balanceSheet.annualReports
              .slice(0, years)
              .map((y) =>
                (
                  Number(y.totalCurrentAssets) /
                  Number(y.totalCurrentLiabilities)
                ).toFixed(2),
              ),
          },
          {
            name: 'LT Debt/Equity Ratio (%)',
            numbers: balanceSheet.annualReports
              .slice(0, years)
              .map((y) =>
                !y.longTermDebt || !y.totalShareholderEquity
                  ? '--'
                  : (
                      (Number(y.longTermDebt) /
                        Number(y.totalShareholderEquity)) *
                      100
                    ).toFixed(1),
              ),
          },
          {
            name: 'Total Debt/Equity Ratio (%)',
            numbers: balanceSheet.annualReports
              .slice(0, years)
              .map((y) =>
                !y.totalLiabilities || !y.totalShareholderEquity
                  ? '--'
                  : (
                      (Number(y.totalLiabilities) /
                        Number(y.totalShareholderEquity)) *
                      100
                    ).toFixed(1),
              ),
          },
        ],
      },
      {
        name: 'Ratios (%)',
        statistics: [
          {
            name: 'Gross Profit Margin',
            numbers: incomeStatement.annualReports
              .slice(0, years)
              .map((y) =>
                (
                  (Number(y.grossProfit) / Number(y.totalRevenue)) *
                  100
                ).toFixed(1),
              ),
          },
          {
            name: 'Operating Margin',
            numbers: incomeStatement.annualReports
              .slice(0, years)
              .map((y) =>
                (
                  (Number(y.operatingIncome) / Number(y.totalRevenue)) *
                  100
                ).toFixed(1),
              ),
          },
          {
            name: 'Net Margin',
            numbers: incomeStatement.annualReports
              .slice(0, years)
              .map((y) =>
                ((Number(y.netIncome) / Number(y.totalRevenue)) * 100).toFixed(
                  1,
                ),
              ),
          },
          {
            name: 'Return on Assets',
            numbers: incomeStatement.annualReports
              .slice(0, years)
              .map((y, i) =>
                (
                  (Number(y.netIncome) /
                    Number(balanceSheet.annualReports[i].totalAssets)) *
                  100
                ).toFixed(1),
              ),
          },
          {
            name: 'Return on Equity',
            numbers: incomeStatement.annualReports
              .slice(0, years)
              .map((y, i) =>
                (
                  (Number(y.netIncome) /
                    Number(
                      balanceSheet.annualReports[i].totalShareholderEquity,
                    )) *
                  100
                ).toFixed(1),
              ),
          },
        ],
      },
      {
        name: 'Risk Analysis',
        statistics: [
          { name: 'Cash Cycle (days)', numbers: [] },
          {
            name: 'Cash Flow/Cap Ex',
            numbers: cashflow.annualReports
              .slice(0, years)
              .map((y, i) =>
                !y.operatingCashflow || !y.capitalExpenditures
                  ? '--'
                  : (
                      (Number(y.operatingCashflow) /
                        Number(y.capitalExpenditures)) *
                      100
                    ).toFixed(1),
              ),
          },
          {
            name: 'Oper. Income/Int. Exp. (ratio)',
            numbers: incomeStatement.annualReports
              .slice(0, years)
              .map((y, i) =>
                !y.interestExpense
                  ? '--'
                  : (
                      (Number(y.operatingIncome) / Number(y.interestExpense)) *
                      100
                    ).toFixed(1),
              ),
          },
          {
            name: 'Payout Ratio',
            numbers: cashflow.annualReports
              .slice(0, years)
              .map((y, i) =>
                !y.dividendPayout
                  ? '--'
                  : (
                      (Number(y.dividendPayout) /
                        Number(incomeStatement.annualReports[i].netIncome)) *
                      100
                    ).toFixed(1),
              ),
          },
        ],
      },
    ],
  };
};
