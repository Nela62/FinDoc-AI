const FALLBACK_VALUE = '--';

export const safeNumber = (value: any): number | null => {
  const num = Number(value);
  return !isNaN(num) && isFinite(num) ? num : null;
};

export const safeDivide = (numerator: any, denominator: any): number | null => {
  const num = safeNumber(numerator);
  const den = safeNumber(denominator);
  if (num === null || den === null || den === 0) return null;
  return num / den;
};

export const safePercentage = (value: any, total: any): number | null => {
  const result = safeDivide(value, total);
  return result !== null ? result * 100 : null;
};

export const formatSafeNumber = (
  value: any,
  prefix: string = '',
  suffix: string = '',
  options: Intl.NumberFormatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
): string => {
  const num = safeNumber(value);
  return num !== null
    ? prefix && num < 0
      ? '-' + prefix + Math.abs(num).toLocaleString('en-US', options) + suffix
      : prefix + num.toLocaleString('en-US', options) + suffix
    : FALLBACK_VALUE;
};

export const formatSafePercentage = (value: any, total: any): string => {
  const percent = safePercentage(value, total);
  return percent !== null ? formatSafeNumber(percent, '', '%') : FALLBACK_VALUE;
};
