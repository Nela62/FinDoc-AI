import { AnalysisMetrics } from '@/lib/templates/docxTables/financialAnalysisTable';
import { MetricsData } from '@/types/metrics';
import { calculateRatio, getYearlyMetric } from './financialUtils';

export const getFinancialAndRiskAnalysisMetrics = (
  annualFundamentals: MetricsData,
): AnalysisMetrics => {
  const curYear = new Date().getFullYear();
  const years =
    annualFundamentals.incomeStatement.TotalRevenue.length > 3
      ? 3
      : annualFundamentals.incomeStatement.TotalRevenue.length;

  return {
    years: Array.from({ length: years }, (_, i) => curYear - i - 1).reverse(),
    categories: [
      {
        name: 'Cash',
        statistics: [
          {
            name: 'Cash ($ in Millions)',
            numbers: getYearlyMetric(
              annualFundamentals,
              'balanceSheet',
              'CashAndCashEquivalents',
              years,
              1.0e6,
            ),
          },
          {
            name: 'Working Capital ($ in Millions)',
            numbers: getYearlyMetric(
              annualFundamentals,
              'balanceSheet',
              'WorkingCapital',
              years,
              1.0e6,
            ),
          },
          {
            name: 'Current Ratio',
            numbers:
              annualFundamentals.balanceSheet.CurrentAssets?.slice(-years).map(
                (y, i) =>
                  calculateRatio(
                    y.value,
                    annualFundamentals.balanceSheet.CurrentLiabilities?.slice(
                      -years,
                    )[i].value,
                  ),
              ) ?? Array.from({ length: years }, () => '--'),
          },
          {
            name: 'LT Debt/Equity Ratio (%)',
            numbers:
              annualFundamentals.balanceSheet.LongTermDebtAndCapitalLeaseObligation?.slice(
                -years,
              ).map((y, i) =>
                calculateRatio(
                  y.value * 100,
                  annualFundamentals.balanceSheet.StockholdersEquity.slice(
                    -years,
                  )[i].value,
                ),
              ) ?? Array.from({ length: years }, () => '--'),
          },
          {
            name: 'Total Debt/Equity Ratio (%)',
            numbers:
              annualFundamentals.balanceSheet.TotalDebt?.slice(-years).map(
                (y, i) =>
                  calculateRatio(
                    y.value * 100,
                    annualFundamentals.balanceSheet.StockholdersEquity.slice(
                      -years,
                    )[i].value,
                  ),
              ) ?? Array.from({ length: years }, () => '--'),
          },
        ],
      },
      {
        name: 'Ratios (%)',
        statistics: [
          {
            name: 'Gross Profit Margin',
            numbers:
              annualFundamentals.incomeStatement.GrossProfit?.slice(-years).map(
                (y, i) =>
                  calculateRatio(
                    y.value * 100,
                    annualFundamentals.incomeStatement.TotalRevenue.slice(
                      -years,
                    )[i].value,
                  ),
              ) ?? Array.from({ length: years }, () => '--'),
          },
          {
            name: 'Operating Margin',
            numbers:
              annualFundamentals.incomeStatement.OperatingIncome?.slice(
                -years,
              ).map((y, i) =>
                calculateRatio(
                  y.value * 100,
                  annualFundamentals.incomeStatement.TotalRevenue.slice(-years)[
                    i
                  ].value,
                ),
              ) ?? Array.from({ length: years }, () => '--'),
          },
          {
            name: 'Net Margin',
            numbers:
              annualFundamentals.incomeStatement.NetIncome?.slice(-years).map(
                (y, i) =>
                  calculateRatio(
                    y.value * 100,
                    annualFundamentals.incomeStatement.TotalRevenue.slice(
                      -years,
                    )[i].value,
                  ),
              ) ?? Array.from({ length: years }, () => '--'),
          },
          {
            name: 'Return on Assets',
            numbers:
              annualFundamentals.incomeStatement.NetIncome?.slice(-years).map(
                (y, i) =>
                  calculateRatio(
                    y.value * 100,
                    annualFundamentals.balanceSheet.TotalAssets?.slice(-years)[
                      i
                    ].value,
                  ),
              ) ?? Array.from({ length: years }, () => '--'),
          },
          {
            name: 'Return on Equity',
            numbers:
              annualFundamentals.incomeStatement.NetIncome?.slice(-years).map(
                (y, i) =>
                  calculateRatio(
                    y.value * 100,
                    annualFundamentals.balanceSheet.StockholdersEquity.slice(
                      -years,
                    )[i].value,
                  ),
              ) ?? Array.from({ length: years }, () => '--'),
          },
        ],
      },
      {
        name: 'Risk Analysis',
        statistics: [
          {
            name: 'Cash Flow/Cap Ex',
            numbers:
              annualFundamentals.cashFlow.OperatingCashFlow?.slice(-years).map(
                (y, i) =>
                  calculateRatio(
                    y.value * 100,
                    -annualFundamentals.cashFlow.CapitalExpenditure?.slice(
                      -years,
                    )[i]?.value ?? 0,
                  ),
              ) ?? Array.from({ length: years }, () => '--'),
          },
          {
            name: 'Oper. Income/Int. Exp. (ratio)',
            numbers:
              annualFundamentals.incomeStatement.OperatingIncome?.slice(
                -years,
              ).map((y, i) =>
                calculateRatio(
                  y.value * 100,
                  annualFundamentals.incomeStatement.InterestExpense?.slice(
                    -years,
                  )[i].value,
                ),
              ) ?? Array.from({ length: years }, () => '--'),
          },
          {
            name: 'Payout Ratio',
            numbers:
              annualFundamentals.cashFlow.CommonStockDividendPaid?.slice(
                -years,
              ).map((y, i) =>
                calculateRatio(
                  y.value * 100,
                  annualFundamentals.incomeStatement.NetIncome.slice(-years)[i]
                    .value,
                ),
              ) ?? Array.from({ length: years }, () => '--'),
          },
        ],
      },
    ],
  };
};
