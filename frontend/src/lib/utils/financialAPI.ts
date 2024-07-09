import { eachDayOfInterval, format, max, sub } from 'date-fns';
import {
  DailyStockData,
  DailyStockDataPoint,
  Overview,
} from '@/types/alphaVantageApi';
import { AnalysisMetrics } from '../templates/docxTables/financialAnalysisTable';
import { MetricsData, PolygonData } from '@/types/metrics';
import { capitalizeWords } from './formatText';

// Alpha Vantage API
export async function fetchNews(
  ticker: string,
  timeFrom: string,
  timeTo: string,
) {
  // Time should be in this format: 20240312T0000
  const endpoint = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${ticker}&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}&time_from=${timeFrom}&time_to=${timeTo}&sort=RELEVANCE&limit=15`;

  const res = await fetch(endpoint);

  if (!res.ok) throw new Error('Could not fetch news');

  return res.json();
}

export async function fetchDailyStock(ticker: string) {
  const endpoint = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}&outputsize=full`;

  const res = await fetch(endpoint);

  if (!res.ok) throw new Error('Could not fetch stock data');

  return res.json();
}

export async function fetchOverview(ticker: string): Promise<Overview> {
  const endpoint = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}`;

  const res = await fetch(endpoint);

  if (!res.ok) throw new Error('Could not fetch stock data');

  return res.json();
}

// Metrics calculations
export const getNWeeksStock = (
  dailyStock: DailyStockData,
  weeks: number = 52,
  start: Date = new Date(),
) => {
  const data = dailyStock['Time Series (Daily)'];
  const nWeeksAgo = sub(start, { weeks: weeks });
  console.log(nWeeksAgo);
  const days = eachDayOfInterval({ start: nWeeksAgo, end: start });
  console.log(start);
  const stockData: DailyStockDataPoint[] = [];

  days.forEach((day) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    if (data.hasOwnProperty(formattedDay)) {
      stockData.push({ day: formattedDay, data: data[formattedDay] });
    }
  });

  return stockData;
};

export const getNMonthsStock = (
  dailyStock: DailyStockData,
  months: number = 3,
  start: Date = new Date(),
) => {
  const data = dailyStock['Time Series (Daily)'];
  const nMonthsAgo = sub(start, { months: months });
  const days = eachDayOfInterval({ start: nMonthsAgo, end: start });
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

  const days = eachDayOfInterval({ start: nYearsAgo, end: start });
  const stockData: DailyStockDataPoint[] = [];

  days.forEach((day) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    if (data.hasOwnProperty(formattedDay)) {
      stockData.push({ day: formattedDay, data: data[formattedDay] });
    }
  });

  return stockData;
};

export const getYearsStock = (dailyStock: DailyStockData, year: number) => {
  const data = dailyStock['Time Series (Daily)'];
  const days = eachDayOfInterval({
    start: new Date(year, 0, 1),
    end: new Date(year, 11, 31),
  });

  const stockData: DailyStockDataPoint[] = [];

  days.forEach((day) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    if (data.hasOwnProperty(formattedDay)) {
      stockData.push({ day: formattedDay, data: data[formattedDay] });
    }
  });

  return stockData;
};

export const getLatestStockDataPoint = (stockData: DailyStockDataPoint[]) =>
  stockData[stockData.length - 1];

export const getHighestStockPrice = (stockData: DailyStockDataPoint[]) =>
  Math.max(...stockData.map((value) => Number(value.data['2. high'])));

export const getLowestStockPrice = (stockData: DailyStockDataPoint[]) =>
  Math.min(...stockData.map((value) => Number(value.data['3. low'])));

export const getMeanClosingStockPrice = (stockData: DailyStockDataPoint[]) => {
  const sum = stockData.reduce(
    (acc, cur) => acc + Number(cur.data['5. adjusted close']),
    0,
  );
  return (sum / stockData.length).toFixed(2);
};

export const getAverageDailyVolume = (stockData: DailyStockDataPoint[]) => {
  // For 20 trading days
  const volumeValues = stockData.map((value) =>
    Number(value.data['6. volume']),
  );
  const sum = volumeValues.slice(0, 20).reduce((acc, cur) => acc + cur, 0);
  return sum / 20;
};

const formatNumber = (
  value: number,
  minimumFractionDigits: number = 2,
  maximumFractionDigits: number = 2,
): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits,
    maximumFractionDigits,
  });
};

const formatValuationNumber = (
  value: number,
  minimumFractionDigits: number = 1,
  maximumFractionDigits: number = 1,
): string => {
  return value < 0
    ? `(${Math.abs(value).toLocaleString('en-US', {
        minimumFractionDigits,
        maximumFractionDigits,
      })})`
    : value.toLocaleString('en-US', {
        minimumFractionDigits,
        maximumFractionDigits,
      });
};

const getSuffixAndDivisor = (
  value: number,
  long: boolean,
): [string, number] => {
  const suffixes: [string, number][] = long
    ? [
        ['Trillion', 1e12],
        ['Billion', 1e9],
        ['Million', 1e6],
      ]
    : [
        ['Tril', 1e12],
        ['Bil', 1e9],
        ['Mil', 1e6],
        ['K', 1e3],
      ];

  for (const [suffix, divisor] of suffixes) {
    if (Math.abs(value) >= divisor) {
      return [suffix, divisor];
    }
  }

  return ['', 1];
};

function moneyFormat(labelValue: string | number, long: boolean): string {
  const value = Math.abs(Number(labelValue));
  const [suffix, divisor] = getSuffixAndDivisor(value, long);

  if (divisor === 1) {
    return formatNumber(value);
  }

  return `${formatNumber(value / divisor)}${suffix ? ' ' + suffix : ''}`;
}

// function moneyFormat(labelValue: string | number, long: boolean) {
//   const strings = long
//     ? [' Trillion', ' Billion', ' Million']
//     : [' Tril', ' Bil', ' Mil'];
//   // Nine Zeroes for Billions
//   return Math.abs(Number(labelValue)) >= 1.0e12
//     ? (Math.abs(Number(labelValue)) / 1.0e12).toLocaleString('en-US', {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       }) + strings[0]
//     : Math.abs(Number(labelValue)) >= 1.0e9
//     ? (Math.abs(Number(labelValue)) / 1.0e9).toLocaleString('en-US', {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       }) + strings[1]
//     : // Six Zeroes for Millions
//     Math.abs(Number(labelValue)) >= 1.0e6
//     ? (Math.abs(Number(labelValue)) / 1.0e6).toLocaleString('en-US', {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       }) + strings[2]
//     : // Three Zeroes for Thousands
//     Math.abs(Number(labelValue)) >= 1.0e3
//     ? Math.abs(Number(labelValue)) / 1.0e3 + 'K'
//     : Math.abs(Number(labelValue)).toLocaleString('en-US', {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       });
// }

const getDebtCapitalRatio = (quarterlyFundamentals: MetricsData) =>
  Number(quarterlyFundamentals.balanceSheet.TotalDebt.slice(-1)) /
  Number(quarterlyFundamentals.balanceSheet.StockholdersEquity.slice(-1));

const getReturnOnEquity = (quarterlyFundamentals: MetricsData) =>
  Number(
    quarterlyFundamentals.incomeStatement.NetIncome.slice(-4).reduce(
      (prev, cur) => prev + cur.value,
      0,
    ),
  ) / Number(quarterlyFundamentals.balanceSheet.StockholdersEquity.slice(-1));

const getNetMargin = (quarterlyFundamentals: MetricsData) =>
  Number(
    quarterlyFundamentals.incomeStatement.NetIncome.slice(-4).reduce(
      (prev, cur) => prev + cur.value,
      0,
    ),
  ) /
  Number(
    quarterlyFundamentals.incomeStatement.TotalRevenue.slice(-4).reduce(
      (prev, cur) => prev + cur.value,
      0,
    ),
  );

const getPayoutRatio = (quarterlyFundamentals: MetricsData) =>
  Number(
    quarterlyFundamentals.cashFlow.CommonStockDividendPaid.slice(-4).reduce(
      (prev, cur) => prev + cur.value,
      0,
    ),
  ) /
  Number(
    quarterlyFundamentals.incomeStatement.NetIncome.slice(-4).reduce(
      (prev, cur) => prev + cur.value,
      0,
    ),
  );

const getCurrentRatio = (quarterlyFundamentals: MetricsData) =>
  Number(quarterlyFundamentals.balanceSheet.CurrentAssets.slice(-1)) /
  Number(quarterlyFundamentals.balanceSheet.CurrentLiabilities.slice(-1));

const getRevenueTTM = (quarterlyFundamentals: MetricsData) =>
  Number(
    quarterlyFundamentals.incomeStatement.TotalRevenue.slice(-4).reduce(
      (prev, cur) => prev + cur.value,
      0,
    ),
  );

const getEPSTTM = (quarterlyFundamentals: MetricsData) =>
  Number(
    quarterlyFundamentals.incomeStatement.BasicEPS.slice(-4).reduce(
      (prev, cur) => prev + cur.value,
      0,
    ),
  );

const getCurrentFYPE = (
  quarterlyFundamentals: MetricsData,
  stockData: DailyStockDataPoint[],
) =>
  Number(stockData[0].data['5. adjusted close']) /
  Number(quarterlyFundamentals.incomeStatement.BasicEPS.slice(-1));

const getPriceSales = (
  overview: Overview,
  quarterlyFundamentals: MetricsData,
) =>
  Number(overview.MarketCapitalization) / getRevenueTTM(quarterlyFundamentals);

const getPriceBooks = (
  overview: Overview,
  quarterlyFundamentals: MetricsData,
) =>
  Number(overview.MarketCapitalization) /
  (Number(quarterlyFundamentals.balanceSheet.CurrentAssets.slice(-1)) -
    Number(quarterlyFundamentals.balanceSheet.CurrentLiabilities.slice(-1)));

const getBookValueShare = (quarterlyFundamentals: MetricsData) =>
  Number(quarterlyFundamentals.balanceSheet.StockholdersEquity.slice(-1)) /
  Number(quarterlyFundamentals.incomeStatement.DilutedAverageShares.slice(-1));

const getGrossProfitTTM = (quarterlyFundamentals: MetricsData) =>
  quarterlyFundamentals.incomeStatement.GrossProfit.slice(-4).reduce(
    (prev, cur) => prev + cur.value,
    0,
  );

export type Metric = { title: string; value: string };

export const getTopBarMetrics = (
  overview: Overview,
  targetPrice: number,
  stockData: DailyStockDataPoint[],
  quarterlyFundamentals: MetricsData,
): Metric[] => {
  const lastClosingPrice = Number(
    getLatestStockDataPoint(stockData).data['5. adjusted close'],
  );

  const topBarMetrics: Metric[] = [
    { title: 'Last Price', value: `$${formatNumber(lastClosingPrice)}` },
    { title: 'Target Price', value: `$${formatNumber(targetPrice)}` },
    {
      title: 'Price/Target',
      value: formatNumber(lastClosingPrice / targetPrice),
    },
    {
      title: 'Market Cap',
      value: `$${moneyFormat(overview.MarketCapitalization, false)}`,
    },
    { title: 'EBITDA', value: `$${moneyFormat(overview.EBITDA, false)}` },
    { title: 'Diluted EPS TTM', value: `$${overview.DilutedEPSTTM}` },
    {
      title: 'Revenue per share TTM',
      value: `$${overview.RevenuePerShareTTM}`,
    },
    {
      title: 'Gross profit TTM',
      value: `$${moneyFormat(getGrossProfitTTM(quarterlyFundamentals), false)}`,
    },
    { title: 'Forward PE', value: overview.ForwardPE },
    { title: 'Trailing PE', value: overview.TrailingPE },
  ];

  return topBarMetrics;
};

type MetricSection = {
  title: string;
  metrics: Metric[];
};

export type SidebarMetrics = MetricSection[];

// TODO: add support for foreign currencies
export const getSidebarMetrics = (
  overview: Overview,
  stockData: DailyStockDataPoint[],
  targetPrice: number,
  financialStrengthRating: string,
  quarterlyFundamentals: MetricsData,
): SidebarMetrics => {
  const marketOverview: MetricSection = {
    title: 'Market Overview',
    metrics: [
      {
        title: 'Price',
        value: `$${formatNumber(
          Number(getLatestStockDataPoint(stockData)?.data['5. adjusted close']),
        )}`,
      },
      { title: 'Target Price', value: `$${targetPrice}` },
      {
        title: '52 Week Price Range',
        value: `$${formatNumber(
          getLowestStockPrice(stockData),
        )} to $${formatNumber(getHighestStockPrice(stockData))}`,
      },
      {
        title: 'Shares Outstanding',
        value: moneyFormat(Number(overview.SharesOutstanding), true),
      },
      {
        title: 'Dividend',
        value:
          overview.DividendPerShare === 'None'
            ? '0'
            : `$${overview.DividendPerShare}`,
      },
      { title: 'Dividend Yield', value: overview.DividendYield },
      {
        title: 'Average Daily Volume',
        value: `${moneyFormat(getAverageDailyVolume(stockData), true)}`,
      },
    ],
  };

  const sectorOverview: MetricSection = {
    title: 'Sector Overview',
    metrics: [
      { title: 'Sector', value: capitalizeWords(overview.Sector) },
      { title: 'Industry', value: capitalizeWords(overview.Industry) },
    ],
  };

  const financialStrength: MetricSection = {
    title: 'Financial Strength',
    metrics: [
      { title: 'Fin. Strength Rating', value: financialStrengthRating },
      {
        title: 'Debt/Capital Ratio',
        value: `${formatNumber(
          getDebtCapitalRatio(quarterlyFundamentals) * 100,
        )}%`,
      },
      {
        title: 'Return on Equity',
        value: `${formatNumber(
          getReturnOnEquity(quarterlyFundamentals) * 100,
        )}%`,
      },
      {
        title: 'Net Margin',
        value: `${formatNumber(getNetMargin(quarterlyFundamentals) * 100)}%`,
      },
      {
        title: 'Payout Ratio',
        value:
          overview.DividendPerShare === 'None'
            ? '0'
            : formatNumber(getPayoutRatio(quarterlyFundamentals)),
      },
      {
        title: 'Current Ratio',
        value: formatNumber(getCurrentRatio(quarterlyFundamentals)),
      },
      {
        title: 'Revenue',
        value: `$${moneyFormat(Number(overview.RevenueTTM), true)}`,
      },
      {
        title: 'After-Tax Income',
        value: `$${moneyFormat(getRevenueTTM(quarterlyFundamentals), true)}`,
      },
      {
        title: 'EPS',
        value: `$${formatNumber(getEPSTTM(quarterlyFundamentals))}`,
      },
      { title: 'Book Value', value: formatNumber(Number(overview.BookValue)) },
    ],
  };

  // TODO: add prior fy p/e
  const valuation: MetricSection = {
    title: 'Valuation',
    metrics: [
      {
        title: 'Current FY P/E',
        value: formatNumber(getCurrentFYPE(quarterlyFundamentals, stockData)),
      },
      {
        title: 'Price/Sales',
        value: formatNumber(getPriceSales(overview, quarterlyFundamentals)),
      },
      {
        title: 'Price/Book',
        value: formatNumber(getPriceBooks(overview, quarterlyFundamentals)),
      },
      {
        title: 'Book Value/Share',
        value: formatNumber(getBookValueShare(quarterlyFundamentals)),
      },
    ],
  };

  const forecastedGrowth: MetricSection = {
    title: 'Forecasted Growth',
    metrics: [
      { title: '1 Year EPS Growth Forecast', value: '--' },
      { title: '5 Year EPS Growth Forecast', value: '--' },
      { title: '1 Year Dividend Growth Forecast', value: '--' },
    ],
  };

  const risk: MetricSection = {
    title: 'Risk',
    metrics: [{ title: 'Beta', value: overview.Beta }],
  };

  return [
    marketOverview,
    sectorOverview,
    financialStrength,
    valuation,
    forecastedGrowth,
    risk,
  ];
};

const divideByMillion = (num: number | string) =>
  num === 'None'
    ? '--'
    : (Number(num) / 1.0e6).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });

export const getGrowthAndValuationAnalysisMetrics = (
  annualFundamentals: MetricsData,
  stockData: DailyStockData,
): AnalysisMetrics => {
  const curY = new Date().getFullYear();
  const years =
    annualFundamentals.incomeStatement.TotalRevenue.length > 5
      ? 5
      : annualFundamentals.incomeStatement.TotalRevenue.length;

  const highestStock = [...Array(years).keys()]
    .map((_, i) =>
      Number(getHighestStockPrice(getYearsStock(stockData, curY - i - 1))),
    )
    .reverse();

  const lowestStock = [...Array(years).keys()]
    .map((_, i) =>
      Number(getLowestStockPrice(getYearsStock(stockData, curY - i - 1))),
    )
    .reverse();

  // TODO: if array is less than years, add hyphens
  // TODO: hyphens for tax rate if income taxes are less than 0
  return {
    years: [...Array(years).keys()].map((_, i) => curY - i - 1).reverse(),
    categories: [
      {
        name: 'Growth Analysis',
        statistics: [
          {
            name: 'Revenue',
            numbers: annualFundamentals.incomeStatement.TotalRevenue.slice(
              -years,
            ).map((y) => divideByMillion(y.value)),
          },
          {
            name: 'COGS',
            numbers: annualFundamentals.incomeStatement.CostOfRevenue.slice(
              -years,
            ).map((y) => divideByMillion(y.value)),
          },
          {
            name: 'Gross Profit',
            numbers: annualFundamentals.incomeStatement.GrossProfit.slice(
              -years,
            ).map((y) => divideByMillion(y.value)),
          },
          {
            name: 'SG&A',
            numbers:
              annualFundamentals.incomeStatement.SellingGeneralAndAdministration.slice(
                -years,
              ).map((y) => divideByMillion(y.value)),
          },
          {
            name: 'R&D',
            numbers:
              annualFundamentals.incomeStatement.ResearchAndDevelopment.slice(
                -years,
              ).map((y) => divideByMillion(y.value)),
          },
          {
            name: 'Operating Income',
            numbers: annualFundamentals.incomeStatement.OperatingIncome.slice(
              -years,
            ).map((y) => divideByMillion(y.value)),
          },
          {
            name: 'Interest Expense',
            numbers: annualFundamentals.incomeStatement.InterestExpense.slice(
              -years,
            ).map((y) => divideByMillion(y.value)),
          },
          {
            name: 'Pretax Income',
            numbers: annualFundamentals.incomeStatement.PretaxIncome.slice(
              -years,
            ).map((y) => divideByMillion(y.value)),
          },
          {
            name: 'Income Taxes',
            numbers: annualFundamentals.incomeStatement.TaxProvision.slice(
              -years,
            ).map((y) => divideByMillion(y.value)),
          },
          {
            name: 'Tax Rate (%)',
            numbers: annualFundamentals.incomeStatement.TaxProvision.slice(
              -years,
            ).map((y, i) =>
              (
                Number(y.value) /
                Number(
                  annualFundamentals.incomeStatement.PretaxIncome.slice(-years)[
                    i
                  ].value,
                )
              ).toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }),
            ),
          },
          {
            name: 'Net Income',
            numbers: annualFundamentals.incomeStatement.NetIncome.slice(
              -years,
            ).map((y) => divideByMillion(y.value)),
          },
          {
            name: 'Diluted Shares Outstanding',
            numbers:
              annualFundamentals.incomeStatement.DilutedAverageShares.slice(
                -years,
              ).map((y) => divideByMillion(y.value)),
          },
          {
            name: 'EPS',
            numbers: annualFundamentals.incomeStatement.BasicEPS.slice(
              -years,
            ).map((y) => y.value),
          },
          {
            name: 'Dividend',
            numbers: annualFundamentals.cashFlow.CommonStockDividendPaid.slice(
              -years,
            ).map((y, i) =>
              Number(
                Math.abs(
                  y.value /
                    annualFundamentals.balanceSheet.ShareIssued[i].value,
                ).toFixed(1),
              ),
            ),
          },
        ],
      },
      {
        name: 'Growth Rates (%)',
        statistics: [
          {
            name: 'Revenue',
            numbers: annualFundamentals.incomeStatement.TotalRevenue.slice(
              -5,
            ).map((cur, i) =>
              i - 1 >= 0
                ? (
                    ((Number(cur.value) -
                      Number(
                        annualFundamentals.incomeStatement.TotalRevenue[i - 1]
                          .value,
                      )) *
                      100) /
                    Number(
                      annualFundamentals.incomeStatement.TotalRevenue[i - 1]
                        .value,
                    )
                  ).toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })
                : '--',
            ),
          },
          {
            name: 'Operating Income',
            numbers: annualFundamentals.incomeStatement.OperatingIncome.slice(
              -5,
            ).map((cur, i) =>
              i - 1 >= 0
                ? (
                    ((Number(cur.value) -
                      Number(
                        annualFundamentals.incomeStatement.OperatingIncome[
                          i - 1
                        ].value,
                      )) *
                      100) /
                    Number(
                      annualFundamentals.incomeStatement.OperatingIncome[i - 1]
                        .value,
                    )
                  ).toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })
                : '--',
            ),
          },
          {
            name: 'Net Income',
            numbers: annualFundamentals.incomeStatement.NetIncome.slice(-5).map(
              (cur, i) =>
                i - 1 >= 0
                  ? (
                      ((Number(cur.value) -
                        Number(
                          annualFundamentals.incomeStatement.NetIncome[i - 1]
                            .value,
                        )) *
                        100) /
                      Number(
                        annualFundamentals.incomeStatement.NetIncome[i - 1]
                          .value,
                      )
                    ).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })
                  : '--',
            ),
          },
          {
            name: 'EPS',
            numbers: annualFundamentals.incomeStatement.BasicEPS.slice(-5).map(
              (cur, i) =>
                i - 1 >= 0
                  ? (
                      ((Number(cur.value) -
                        Number(
                          annualFundamentals.incomeStatement.BasicEPS[i - 1]
                            .value,
                        )) *
                        100) /
                      Number(
                        annualFundamentals.incomeStatement.BasicEPS[i - 1]
                          .value,
                      )
                    ).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })
                  : '--',
            ),
          },
          {
            name: 'Dividend',
            numbers: annualFundamentals.cashFlow.CommonStockDividendPaid.slice(
              -5,
            ).map((cur, i) => {
              if (i - 1 < 0) {
                return '--';
              } else {
                const curDividend =
                  Number(cur.value) /
                  Number(annualFundamentals.balanceSheet.ShareIssued[i].value);
                const prevDividend =
                  Number(
                    annualFundamentals.cashFlow.CommonStockDividendPaid[i - 1]
                      .value,
                  ) /
                  Number(
                    annualFundamentals.balanceSheet.ShareIssued[i - 1].value,
                  );

                if (prevDividend === 0) {
                  return '--';
                }

                return (
                  ((curDividend - prevDividend) * 100) /
                  prevDividend
                ).toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                });
              }
            }),
          },
          {
            name: 'Sustainable Growth Rate',
            numbers: annualFundamentals.incomeStatement.NetIncome.slice(-5).map(
              (_, i) => {
                const returnOnEquity =
                  Number(
                    annualFundamentals.incomeStatement.NetIncome[i].value,
                  ) /
                  Number(
                    annualFundamentals.balanceSheet.StockholdersEquity[i].value,
                  );

                const payoutRatio =
                  Number(
                    annualFundamentals.cashFlow.CommonStockDividendPaid[i]
                      .value,
                  ) /
                  Number(annualFundamentals.incomeStatement.NetIncome[i].value);

                return (returnOnEquity * (1 - payoutRatio)).toLocaleString(
                  'en-US',
                  {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  },
                );
              },
            ),
          },
        ],
      },
      {
        name: 'Valuation Analysis',
        statistics: [
          {
            name: 'Price: High',
            numbers: highestStock.map((num: number) => `$${formatNumber(num)}`),
          },
          {
            name: 'Price: Low',
            numbers: lowestStock.map((num: number) => `$${formatNumber(num)}`),
          },
          // TODO: calculate
          {
            name: 'Price/Sales: High-Low',
            numbers: annualFundamentals.incomeStatement.TotalRevenue.slice(
              -years,
            ).map(
              (y, i) =>
                `${formatValuationNumber(
                  highestStock[i] /
                    (y.value /
                      annualFundamentals.balanceSheet.ShareIssued[i].value),
                )} - ${formatValuationNumber(
                  lowestStock[i] /
                    (y.value /
                      annualFundamentals.balanceSheet.ShareIssued[i].value),
                )}`,
            ),
          },
          {
            name: 'P/E: High-Low',
            numbers: annualFundamentals.incomeStatement.BasicEPS.slice(
              -years,
            ).map(
              (y, i) =>
                `${formatValuationNumber(
                  highestStock[i] / y.value,
                )} - ${formatValuationNumber(lowestStock[i] / y.value)}`,
            ),
          },
          {
            name: 'Price/Cash Flow: High-Low',
            numbers: annualFundamentals.cashFlow.OperatingCashFlow.slice(
              -years,
            ).map(
              (y, i) =>
                `${formatValuationNumber(
                  highestStock[i] /
                    (y.value /
                      annualFundamentals.balanceSheet.ShareIssued[i].value),
                )} - ${formatValuationNumber(
                  lowestStock[i] /
                    (y.value /
                      annualFundamentals.balanceSheet.ShareIssued[i].value),
                )}`,
            ),
          },
        ],
      },
    ],
  };
};

export const getFinancialAndRiskAnalysisMetrics = (
  annualFundamentals: MetricsData,
): AnalysisMetrics => {
  const curY = new Date().getFullYear();
  const years =
    annualFundamentals.incomeStatement.TotalRevenue.length > 3
      ? 3
      : annualFundamentals.incomeStatement.TotalRevenue.length;

  return {
    years: [...Array(years).keys()].map((_, i) => curY - i - 1).reverse(),
    categories: [
      {
        name: 'Cash',
        statistics: [
          {
            name: 'Cash ($ in Millions)',
            numbers:
              annualFundamentals.balanceSheet.CashAndCashEquivalents.slice(
                -years,
              ).map((y) => divideByMillion(y.value)),
          },
          {
            name: 'Working Capital ($ in Millions)',
            numbers: annualFundamentals.balanceSheet.WorkingCapital.slice(
              -years,
            ).map((y) => divideByMillion(y.value)),
          },
          {
            name: 'Current Ratio',
            numbers: annualFundamentals.balanceSheet.CurrentAssets.slice(
              -years,
            ).map((y, i) =>
              formatNumber(
                y.value /
                  annualFundamentals.balanceSheet.CurrentLiabilities.slice(
                    -years,
                  )[i].value,
              ),
            ),
          },
          {
            name: 'LT Debt/Equity Ratio (%)',
            numbers:
              annualFundamentals.balanceSheet.LongTermDebtAndCapitalLeaseObligation.slice(
                -years,
              ).map((y, i) =>
                formatNumber(
                  (y.value * 100) /
                    annualFundamentals.balanceSheet.StockholdersEquity.slice(
                      -years,
                    )[i].value,
                ),
              ),
          },
          {
            name: 'Total Debt/Equity Ratio (%)',
            numbers: annualFundamentals.balanceSheet.TotalDebt.slice(
              -years,
            ).map((y, i) =>
              formatNumber(
                (y.value * 100) /
                  annualFundamentals.balanceSheet.StockholdersEquity.slice(
                    -years,
                  )[i].value,
              ),
            ),
          },
        ],
      },
      {
        name: 'Ratios (%)',
        statistics: [
          {
            name: 'Gross Profit Margin',
            numbers: annualFundamentals.incomeStatement.GrossProfit.slice(
              -years,
            ).map((y, i) =>
              formatNumber(
                (y.value * 100) /
                  annualFundamentals.incomeStatement.TotalRevenue.slice(-years)[
                    i
                  ].value,
              ),
            ),
          },
          {
            name: 'Operating Margin',
            numbers: annualFundamentals.incomeStatement.OperatingIncome.slice(
              -years,
            ).map((y, i) =>
              formatNumber(
                (y.value * 100) /
                  annualFundamentals.incomeStatement.TotalRevenue.slice(-years)[
                    i
                  ].value,
              ),
            ),
          },
          {
            name: 'Net Margin',
            numbers: annualFundamentals.incomeStatement.NetIncome.slice(
              -years,
            ).map((y, i) =>
              formatNumber(
                (y.value * 100) /
                  annualFundamentals.incomeStatement.TotalRevenue.slice(-years)[
                    i
                  ].value,
              ),
            ),
          },
          {
            name: 'Return on Assets',
            numbers: annualFundamentals.incomeStatement.NetIncome.slice(
              -years,
            ).map((y, i) =>
              formatNumber(
                (y.value * 100) /
                  annualFundamentals.balanceSheet.TotalAssets.slice(-years)[i]
                    .value,
              ),
            ),
          },
          {
            name: 'Return on Equity',
            numbers: annualFundamentals.incomeStatement.NetIncome.slice(
              -years,
            ).map((y, i) =>
              formatNumber(
                (y.value * 100) /
                  annualFundamentals.balanceSheet.StockholdersEquity.slice(
                    -years,
                  )[i].value,
              ),
            ),
          },
        ],
      },
      {
        name: 'Risk Analysis',
        statistics: [
          {
            name: 'Cash Flow/Cap Ex',
            numbers: annualFundamentals.cashFlow.OperatingCashFlow.slice(
              -years,
            ).map((y, i) =>
              formatNumber(
                y.value /
                  -annualFundamentals.cashFlow.CapitalExpenditure.slice(-years)[
                    i
                  ].value,
              ),
            ),
          },
          {
            name: 'Oper. Income/Int. Exp. (ratio)',
            numbers: annualFundamentals.incomeStatement.OperatingIncome.slice(
              -years,
            ).map((y, i) =>
              formatNumber(
                y.value /
                  annualFundamentals.incomeStatement.InterestExpense.slice(
                    -years,
                  )[i].value,
              ),
            ),
          },
          {
            name: 'Payout Ratio',
            numbers: annualFundamentals.cashFlow.CommonStockDividendPaid.slice(
              -years,
            ).map((y, i) =>
              formatNumber(
                y.value /
                  annualFundamentals.incomeStatement.NetIncome.slice(-years)[i]
                    .value,
              ),
            ),
          },
        ],
      },
    ],
  };
};

export const getSources = () => {};
