import { QUARTERLY_FUNDAMENTALS } from '@/lib/data/quarterly_fundamentals';
import { getDebtCapitalRatio } from './financialMetrics';

test('get capital debt ratio', () => {
  expect(getDebtCapitalRatio(QUARTERLY_FUNDAMENTALS)).toBe('63.80%');
});
