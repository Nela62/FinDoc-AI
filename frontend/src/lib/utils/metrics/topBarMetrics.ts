import { DailyStockDataPoint, Overview } from '@/types/alphaVantageApi';
import { Metric, MetricsData } from '@/types/metrics';
import { getLatestStockDataPoint } from './stock';
import { formatNumber, moneyFormat } from './financialUtils';
import { getGrossProfitTTM } from './financialMetrics';
import { formatSafeNumber } from './safeCalculations';

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
      value: moneyFormat(overview.MarketCapitalization, 'short', '$'),
    },
    { title: 'EBITDA', value: moneyFormat(overview.EBITDA, 'short', '$') },
    {
      title: 'Diluted EPS TTM',
      value: formatSafeNumber(overview.DilutedEPSTTM, '$'),
    },
    {
      title: 'Revenue per share TTM',
      value: formatSafeNumber(overview.RevenuePerShareTTM, '$'),
    },
    {
      title: 'Gross profit TTM',
      value: moneyFormat(
        getGrossProfitTTM(quarterlyFundamentals),
        'short',
        '$',
      ),
    },
    { title: 'Forward PE', value: formatSafeNumber(overview.ForwardPE) },
    { title: 'Trailing PE', value: formatSafeNumber(overview.TrailingPE) },
  ];

  return topBarMetrics;
};
