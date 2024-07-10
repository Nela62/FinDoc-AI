import { MetricsData, FinancialDataPoint } from '@/types/metrics';
import {
  safeNumber,
  safeDivide,
  formatSafeNumber,
  formatSafePercentage,
} from './safeCalculations';

export const getLatestValue = (data: FinancialDataPoint[]): number | null =>
  safeNumber(data.slice(-1)[0]?.value ?? null);

export const sumLastNValues = (
  data: FinancialDataPoint[],
  n: number,
): number | null => {
  const values = data.slice(-n).map((item) => safeNumber(item.value));
  return values.every((v) => v !== null)
    ? values.reduce((sum, val) => sum! + val!, 0)
    : null;
};

export const calculateGrowthRate = (
  current: number | null,
  previous: number | null,
): string => {
  const growthRate = safeDivide(safeDivide(current, previous)! - 1, 1);
  return formatSafePercentage(growthRate, 1);
};

export const calculateRatio = (
  numerator: number | null,
  denominator: number | null,
): string => formatSafeNumber(safeDivide(numerator, denominator));

export const calculatePercent = (
  part: number | null,
  whole: number | null,
): string => formatSafePercentage(part, whole);

export const getFinancialMetric = (
  metricsData: MetricsData,
  statement: keyof MetricsData,
  metric: string,
  year: number,
  divide: number,
): number | string => {
  const data = metricsData[statement][
    metric as keyof (typeof metricsData)[typeof statement]
  ]?.find((val) => val.asOfDate.includes(year.toString()));
  return formatSafeNumber(data?.value ? data.value / divide : null);
};

export const getYearlyMetric = (
  metricsData: MetricsData,
  statement: keyof MetricsData,
  metric: string,
  years: number,
  divide: number = 1,
): (string | number)[] => {
  const curYear = new Date().getFullYear();

  return Array.from({ length: years }, (_, i) =>
    getFinancialMetric(metricsData, statement, metric, curYear - i - 1, divide),
  ).reverse();
};

const getSuffixAndDivisor = (
  value: number,
  type: 'long' | 'short',
): [string, number] => {
  const suffixes: [string, number][] =
    type === 'long'
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

export const moneyFormat = (
  labelValue: string | number | undefined | null,
  type: 'long' | 'short',
  currencySymbol: string = '',
): string => {
  const value = safeNumber(labelValue);

  if (value) {
    const [suffix, divisor] = getSuffixAndDivisor(value, type);

    if (divisor === 1) {
      return formatSafeNumber(value, currencySymbol);
    }

    return formatSafeNumber(
      value / divisor,
      currencySymbol,
      suffix ? ' ' + suffix : '',
    );
  } else {
    return formatSafeNumber(value);
  }
};

export const formatNumber = (
  value: number,
  minimumFractionDigits: number = 2,
  maximumFractionDigits: number = 2,
): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits,
    maximumFractionDigits,
  });
};
