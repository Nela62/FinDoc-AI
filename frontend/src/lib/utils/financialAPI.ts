import { eachDayOfInterval, format, max, sub } from 'date-fns';
import { TypedSupabaseClient } from '@/types/supabase';
import { fetchAPICacheByEndpoint } from '../queries';
import {
  BalanceSheet,
  DailyStockData,
  DailyStockDataPoint,
  IncomeStatement,
  Overview,
} from '@/types/alphaVantageApi';

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

export async function fetchDailyStock(
  client: TypedSupabaseClient,
  insertCache: any,
  reportId: string,
  userId: string,
  symbol: string,
) {
  const endpoint = `query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}&outputsize=full`;

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
) => {
  const data = dailyStock['Time Series (Daily)'];
  const nWeeksAgo = sub(new Date(), { weeks: weeks });
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
) => {
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
