import { AnalysisMetrics } from '@/lib/templates/docxTables/financialAnalysisTable';
import { DailyStockData } from '@/types/alphaVantageApi';
import { MetricsData } from '@/types/metrics';
import {
  getHighestStockPrice,
  getLowestStockPrice,
  getYearsStock,
} from './stock';
import {
  calculateGrowthRate,
  calculateRatio,
  getYearlyMetric,
} from './financialUtils';
import { formatSafeNumber, safeDivide } from './safeCalculations';

const formatValuationNumber = (value: string) => {
  if (value === '--') return value;
  if (value.includes('-')) return value.replace('-', '(') + ')';
  return value;
};

export const getGrowthAndValuationAnalysisMetrics = (
  annualFundamentals: MetricsData,
  stockData: DailyStockData,
): AnalysisMetrics => {
  const curYear = new Date().getFullYear();
  const years =
    annualFundamentals.incomeStatement.TotalRevenue.length > 5
      ? 5
      : annualFundamentals.incomeStatement.TotalRevenue.length;

  const highestStock = [...Array(years).keys()]
    .map((_, i) =>
      Number(getHighestStockPrice(getYearsStock(stockData, curYear - i - 1))),
    )
    .reverse();

  const lowestStock = [...Array(years).keys()]
    .map((_, i) =>
      Number(getLowestStockPrice(getYearsStock(stockData, curYear - i - 1))),
    )
    .reverse();

  return {
    years: Array.from({ length: years }, (_, i) => curYear - i - 1).reverse(),
    categories: [
      {
        name: 'Growth Analysis',
        statistics: [
          {
            name: 'Revenue',
            numbers: getYearlyMetric(
              annualFundamentals,
              'incomeStatement',
              'TotalRevenue',
              years,
              1.0e6,
            ),
          },
          {
            name: 'COGS',
            numbers: getYearlyMetric(
              annualFundamentals,
              'incomeStatement',
              'CostOfRevenue',
              years,
              1.0e6,
            ),
          },
          {
            name: 'Gross Profit',
            numbers: getYearlyMetric(
              annualFundamentals,
              'incomeStatement',
              'GrossProfit',
              years,
              1.0e6,
            ),
          },
          {
            name: 'SG&A',
            numbers: getYearlyMetric(
              annualFundamentals,
              'incomeStatement',
              'SellingGeneralAndAdministration',
              years,
              1.0e6,
            ),
          },
          {
            name: 'R&D',
            numbers: getYearlyMetric(
              annualFundamentals,
              'incomeStatement',
              'ResearchAndDevelopment',
              years,
              1.0e6,
            ),
          },
          {
            name: 'Operating Income',
            numbers: getYearlyMetric(
              annualFundamentals,
              'incomeStatement',
              'OperatingIncome',
              years,
              1.0e6,
            ),
          },
          {
            name: 'Interest Expense',
            numbers: getYearlyMetric(
              annualFundamentals,
              'incomeStatement',
              'InterestExpense',
              years,
              1.0e6,
            ),
          },
          {
            name: 'Pretax Income',
            numbers: getYearlyMetric(
              annualFundamentals,
              'incomeStatement',
              'PretaxIncome',
              years,
              1.0e6,
            ),
          },
          {
            name: 'Income Taxes',
            numbers: getYearlyMetric(
              annualFundamentals,
              'incomeStatement',
              'TaxProvision',
              years,
              1.0e6,
            ),
          },
          {
            name: 'Tax Rate (%)',
            numbers:
              annualFundamentals.incomeStatement.TaxProvision?.slice(
                -years,
              ).map((y, i) =>
                calculateRatio(
                  Number(y.value),
                  Number(
                    annualFundamentals.incomeStatement.PretaxIncome?.slice(
                      -years,
                    )[i].value,
                  ),
                ),
              ) ?? Array.from({ length: years }, () => '--'),
          },
          {
            name: 'Net Income',
            numbers: getYearlyMetric(
              annualFundamentals,
              'incomeStatement',
              'NetIncome',
              years,
              1.0e6,
            ),
          },
          {
            name: 'Diluted Shares Outstanding',
            numbers: getYearlyMetric(
              annualFundamentals,
              'incomeStatement',
              'DilutedAverageShares',
              years,
              1.0e6,
            ),
          },
          {
            name: 'EPS',
            numbers: getYearlyMetric(
              annualFundamentals,
              'incomeStatement',
              'BasicEPS',
              years,
              1.0e6,
            ),
          },
          {
            name: 'Dividend',
            numbers:
              annualFundamentals.cashFlow.CommonStockDividendPaid?.slice(
                -years,
              ).map((y, i) =>
                calculateRatio(
                  y.value,
                  annualFundamentals.balanceSheet.ShareIssued[i].value,
                ),
              ) ?? Array.from({ length: years }, () => '--'),
          },
        ],
      },
      {
        name: 'Growth Rates (%)',
        statistics: [
          {
            name: 'Revenue',
            numbers:
              annualFundamentals.incomeStatement.TotalRevenue?.slice(-5).map(
                (cur, i) =>
                  i - 1 >= 0
                    ? calculateGrowthRate(
                        cur.value,
                        annualFundamentals.incomeStatement.TotalRevenue[i - 1]
                          .value,
                      )
                    : '--',
              ) ?? Array.from({ length: years }, () => '--'),
          },
          {
            name: 'Operating Income',
            numbers:
              annualFundamentals.incomeStatement.OperatingIncome?.slice(-5).map(
                (cur, i) =>
                  i - 1 >= 0
                    ? calculateGrowthRate(
                        cur.value,
                        annualFundamentals.incomeStatement.OperatingIncome[
                          i - 1
                        ].value,
                      )
                    : '--',
              ) ?? Array.from({ length: years }, () => '--'),
          },
          {
            name: 'Net Income',
            numbers:
              annualFundamentals.incomeStatement.NetIncome?.slice(-5).map(
                (cur, i) =>
                  i - 1 >= 0
                    ? calculateGrowthRate(
                        cur.value,
                        annualFundamentals.incomeStatement.NetIncome[i - 1]
                          .value,
                      )
                    : '--',
              ) ?? Array.from({ length: years }, () => '--'),
          },
          {
            name: 'EPS',
            numbers:
              annualFundamentals.incomeStatement.BasicEPS?.slice(-5).map(
                (cur, i) =>
                  i - 1 >= 0
                    ? calculateGrowthRate(
                        cur.value,
                        annualFundamentals.incomeStatement.BasicEPS[i - 1]
                          .value,
                      )
                    : '--',
              ) ?? Array.from({ length: years }, () => '--'),
          },
          {
            name: 'Dividend',
            numbers:
              annualFundamentals.cashFlow.CommonStockDividendPaid?.slice(
                -5,
              ).map((cur, i) => {
                if (i - 1 < 0) {
                  return '--';
                } else {
                  const curDividend = calculateRatio(
                    cur.value,
                    annualFundamentals.balanceSheet.ShareIssued[i].value,
                  );

                  const prevDividend = calculateRatio(
                    annualFundamentals.cashFlow.CommonStockDividendPaid[i - 1]
                      .value,
                    annualFundamentals.balanceSheet.ShareIssued[i - 1].value,
                  );

                  return calculateGrowthRate(
                    Number(curDividend),
                    Number(prevDividend),
                  );
                }
              }) ?? Array.from({ length: years }, () => '--'),
          },
          // TODO: Ensure that all the years match and not just fetch metrics by their position in array
          {
            name: 'Sustainable Growth Rate',
            numbers:
              (annualFundamentals.cashFlow.CommonStockDividendPaid &&
                annualFundamentals.incomeStatement.NetIncome?.slice(-5).map(
                  (_, i) => {
                    const returnOnEquity = calculateRatio(
                      annualFundamentals.incomeStatement.NetIncome[i].value,
                      annualFundamentals.balanceSheet.StockholdersEquity[i]
                        .value,
                    );

                    const payoutRatio = calculateRatio(
                      annualFundamentals.cashFlow.CommonStockDividendPaid[i]
                        .value,
                      annualFundamentals.incomeStatement.NetIncome[i].value,
                    );

                    return formatSafeNumber(
                      Number(returnOnEquity) * (1 - Number(payoutRatio)),
                    );
                  },
                )) ??
              Array.from({ length: years }, () => '--'),
          },
        ],
      },
      {
        name: 'Valuation Analysis',
        statistics: [
          {
            name: 'Price: High',
            numbers: highestStock.map((num: number) =>
              formatSafeNumber(num, '$'),
            ),
          },
          {
            name: 'Price: Low',
            numbers: lowestStock.map((num: number) =>
              formatSafeNumber(num, '$'),
            ),
          },
          // TODO: calculate
          {
            name: 'Price/Sales: High-Low',
            numbers: annualFundamentals.incomeStatement.TotalRevenue.slice(
              -years,
            ).map(
              (y, i) =>
                `${formatValuationNumber(
                  calculateRatio(
                    highestStock[i],
                    safeDivide(
                      y.value,
                      annualFundamentals.balanceSheet.ShareIssued[i].value,
                    ),
                  ),
                )} - ${formatValuationNumber(
                  calculateRatio(
                    lowestStock[i],
                    safeDivide(
                      y.value,
                      annualFundamentals.balanceSheet.ShareIssued[i].value,
                    ),
                  ),
                )}`,
            ),
          },
          {
            name: 'P/E: High-Low',
            numbers:
              annualFundamentals.incomeStatement.BasicEPS?.slice(-years).map(
                (y, i) =>
                  `${formatValuationNumber(
                    calculateRatio(highestStock[i], y.value),
                  )} - ${formatValuationNumber(
                    calculateRatio(lowestStock[i], y.value),
                  )}`,
              ) ?? Array.from({ length: years }, () => '--'),
          },
          {
            name: 'Price/Cash Flow: High-Low',
            numbers:
              annualFundamentals.cashFlow.OperatingCashFlow?.slice(-years).map(
                (y, i) =>
                  `${formatValuationNumber(
                    calculateRatio(
                      highestStock[i],
                      safeDivide(
                        y.value,
                        annualFundamentals.balanceSheet.ShareIssued[i].value,
                      ),
                    ),
                  )} - ${formatValuationNumber(
                    calculateRatio(
                      lowestStock[i],
                      safeDivide(
                        y.value,
                        annualFundamentals.balanceSheet.ShareIssued[i].value,
                      ),
                    ),
                  )}`,
              ) ?? Array.from({ length: years }, () => '--'),
          },
        ],
      },
    ],
  };
};
