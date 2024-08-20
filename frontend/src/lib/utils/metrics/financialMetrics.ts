import { MetricsData } from '@/types/metrics';
import {
  calculatePercent,
  calculateRatio,
  getLatestValue,
  moneyFormat,
  sumLastNValues,
} from './financialUtils';
import { formatSafeNumber } from './safeCalculations';
import { DailyStockDataPoint, Overview } from '@/types/alphaVantageApi';

export const getDebtCapitalRatio = (
  quarterlyFundamentals: MetricsData,
): string =>
  calculatePercent(
    getLatestValue(quarterlyFundamentals.balanceSheet.TotalDebt ?? []),
    getLatestValue(quarterlyFundamentals.balanceSheet.StockholdersEquity ?? []),
  );

export const getReturnOnEquity = (quarterlyFundamentals: MetricsData): string =>
  calculatePercent(
    getLatestValue(quarterlyFundamentals.incomeStatement.NetIncome ?? []),
    getLatestValue(quarterlyFundamentals.balanceSheet.StockholdersEquity ?? []),
  );

export const getNetMargin = (quarterlyFundamentals: MetricsData): string =>
  calculatePercent(
    sumLastNValues(quarterlyFundamentals.incomeStatement.NetIncome ?? [], 4),
    sumLastNValues(
      quarterlyFundamentals.balanceSheet.StockholdersEquity ?? [],
      4,
    ),
  );

// TODO: Check if the quarter is the latest one possible, otherwise it should be null
export const getPayoutRatio = (quarterlyFundamentals: MetricsData): string =>
  quarterlyFundamentals.cashFlow.CommonStockDividendPaid
    ? calculateRatio(
        sumLastNValues(
          quarterlyFundamentals.cashFlow.CommonStockDividendPaid ?? [],
          4,
        ),
        sumLastNValues(
          quarterlyFundamentals.incomeStatement.NetIncome ?? [],
          4,
        ),
      )
    : '--';

export const getCurrentRatio = (quarterlyFundamentals: MetricsData): string =>
  calculateRatio(
    getLatestValue(quarterlyFundamentals.balanceSheet.CurrentAssets ?? []),
    getLatestValue(quarterlyFundamentals.balanceSheet.CurrentLiabilities ?? []),
  );

export const getRevenueTTM = (quarterlyFundamentals: MetricsData) =>
  moneyFormat(
    sumLastNValues(quarterlyFundamentals.incomeStatement.TotalRevenue ?? [], 4),
    'long',
    '$',
  );

export const getNetIncomeTTTM = (quarterlyFundamentals: MetricsData) =>
  moneyFormat(
    sumLastNValues(quarterlyFundamentals.incomeStatement.NetIncome ?? [], 4),
    'long',
    '$',
  );

export const getEPSTTM = (quarterlyFundamentals: MetricsData) =>
  formatSafeNumber(
    sumLastNValues(quarterlyFundamentals.incomeStatement.BasicEPS ?? [], 4),
    '$',
  );

export const getCurrentFYPE = (
  quarterlyFundamentals: MetricsData,
  stockData: DailyStockDataPoint[],
) =>
  calculateRatio(
    Number(stockData[0].data['5. adjusted close']),
    Number(quarterlyFundamentals.incomeStatement.BasicEPS?.slice(-1)[0].value),
  );

export const getPriceSales = (
  overview: Overview,
  quarterlyFundamentals: MetricsData,
) =>
  calculateRatio(
    Number(overview.MarketCapitalization),
    Number(
      sumLastNValues(
        quarterlyFundamentals.incomeStatement.TotalRevenue ?? [],
        4,
      ),
    ),
  );

export const getPriceBooks = (
  overview: Overview,
  quarterlyFundamentals: MetricsData,
) =>
  calculateRatio(
    Number(overview.MarketCapitalization),
    Number(
      quarterlyFundamentals.balanceSheet.CurrentAssets?.slice(-1)[0].value,
    ) -
      Number(
        quarterlyFundamentals.balanceSheet.CurrentLiabilities?.slice(-1)[0]
          .value,
      ),
  );

export const getBookValueShare = (quarterlyFundamentals: MetricsData) =>
  calculateRatio(
    Number(
      quarterlyFundamentals.balanceSheet.StockholdersEquity?.slice(-1)[0].value,
    ),
    Number(
      quarterlyFundamentals.incomeStatement.DilutedAverageShares?.slice(-1)[0]
        .value,
    ),
  );
export const getGrossProfitTTM = (quarterlyFundamentals: MetricsData) =>
  formatSafeNumber(
    sumLastNValues(
      quarterlyFundamentals.incomeStatement.GrossProfit ?? [],
      4,
    ) ?? null,
  );
