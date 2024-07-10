import { DailyStockDataPoint, Overview } from '@/types/alphaVantageApi';
import { MetricsData, MetricSection } from '@/types/metrics';
import {
  getAverageDailyVolume,
  getHighestStockPrice,
  getLatestStockDataPoint,
  getLowestStockPrice,
} from './stock';
import { formatNumber, moneyFormat } from './financialUtils';
import { formatSafeNumber } from './safeCalculations';
import { capitalizeWords } from '../formatText';
import {
  getBookValueShare,
  getCurrentFYPE,
  getCurrentRatio,
  getDebtCapitalRatio,
  getEPSTTM,
  getNetIncomeTTTM,
  getNetMargin,
  getPayoutRatio,
  getPriceBooks,
  getPriceSales,
  getReturnOnEquity,
  getRevenueTTM,
} from './financialMetrics';

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
        value: moneyFormat(overview.SharesOutstanding, 'long'),
      },
      {
        title: 'Dividend',
        value: formatSafeNumber(overview.DividendPerShare, '$'),
      },
      {
        title: 'Dividend Yield',
        value: formatSafeNumber(overview.DividendYield),
      },
      {
        title: 'Average Daily Volume',
        value: `${moneyFormat(getAverageDailyVolume(stockData), 'long')}`,
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
        value: getDebtCapitalRatio(quarterlyFundamentals),
      },
      {
        title: 'Return on Equity',
        value: getReturnOnEquity(quarterlyFundamentals),
      },
      {
        title: 'Net Margin',
        value: getNetMargin(quarterlyFundamentals),
      },
      {
        title: 'Payout Ratio',
        value: getPayoutRatio(quarterlyFundamentals),
      },
      {
        title: 'Current Ratio',
        value: getCurrentRatio(quarterlyFundamentals),
      },
      {
        title: 'Revenue',
        value: getRevenueTTM(quarterlyFundamentals),
      },
      {
        title: 'After-Tax Income',
        value: getNetIncomeTTTM(quarterlyFundamentals),
      },
      {
        title: 'EPS',
        value: getEPSTTM(quarterlyFundamentals),
      },
      { title: 'Book Value', value: formatSafeNumber(overview.BookValue) },
    ],
  };

  // TODO: add prior fy p/e
  const valuation: MetricSection = {
    title: 'Valuation',
    metrics: [
      {
        title: 'Current FY P/E',
        value: getCurrentFYPE(quarterlyFundamentals, stockData),
      },
      {
        title: 'Price/Sales',
        value: getPriceSales(overview, quarterlyFundamentals),
      },
      {
        title: 'Price/Book',
        value: getPriceBooks(overview, quarterlyFundamentals),
      },
      {
        title: 'Book Value/Share',
        value: getBookValueShare(quarterlyFundamentals),
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
