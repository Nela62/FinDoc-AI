'use client';

import {
  AreaChart,
  XAxis,
  YAxis,
  Area,
  BarChart,
  Bar,
  ReferenceLine,
  ReferenceDot,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

import { forwardRef, useEffect, useState } from 'react';
import {
  DailyStockData,
  Earnings,
  IncomeStatement,
} from '@/types/alphaVantageApi';
import {
  getHighestClosingStockPrice,
  getLatestStockDataPoint,
  getLowestClosingStockPrice,
  getMeanClosingStockPrice,
  getNWeeksStock,
  getNYearsStock,
} from '@/lib/utils/financialAPI';
import { format } from 'date-fns';
import { COMPANY_RATINGS } from '@/lib/data/company_ratings';
import { APPLE_DAILY_ADJUSTED } from '@/lib/data/apple_daily_adjusted';
import { AMAZON_DAILY } from '@/lib/data/amzn_daily';

type ChartProps = {
  colors: string[];
  targetPrice: number;
  incomeStatement: IncomeStatement;
  earnings: Earnings;
  dailyStock: DailyStockData;
};

// const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
// TODO: generate quarters and columns automatically based on date
export const TargetPriceChart = forwardRef((props: ChartProps, ref: any) => {
  // Override console.error
  // This is a hack to suppress the warning about missing defaultProps in the recharts library
  // @link https://github.com/recharts/recharts/issues/3615
  // console.log('rendering chart...');
  // const error = console.error;

  // console.error = (...args: any) => {
  //   if (/defaultProps/.test(args[0])) return;
  //   error(...args);
  // };
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    // Returns null on first render, so the client and server match
    return null;
  }

  const [primaryColor, secondaryColor, accentColor] = props.colors;

  const ratings = COMPANY_RATINGS.output.analysts
    .map((p) => ({
      day: p.rating.target_date,
      data:
        p.rating.price_target === 'None' ? null : Number(p.rating.price_target),
    }))
    .reverse();

  const stockData = getNYearsStock(AMAZON_DAILY, 7);

  const chartStockData = stockData.map((dataPoint) => ({
    day: dataPoint.day,
    data: dataPoint.data['5. adjusted close'],
    target: ratings.find((p) => p.day === dataPoint.day)?.data ?? null,
    raw: dataPoint.data['4. close'],
  }));
  const stockMin = getLowestClosingStockPrice(stockData);
  const stockMax = getHighestClosingStockPrice(stockData);
  const stockMean = getMeanClosingStockPrice(stockData);

  // TODO: add ability to handle revenue in millions
  const revenueData = props.incomeStatement['quarterlyReports']
    .slice(0, 16)
    .map((quarter: any) => ({
      x: quarter.fiscalDateEnding as string,
      y: (Number(quarter.totalRevenue) / 1000000000.0).toFixed(2),
    }))
    .reverse();

  const earningsData = props.earnings.quarterlyEarnings
    .slice(0, 16)
    .map((quarter: any) => ({
      x: quarter.fiscalDateEnding,
      y: quarter.reportedEPS,
    }))
    .reverse();

  console.log(ratings);

  return (
    <div className="bg-background h-fit w-screen text-xs" ref={ref}>
      <ResponsiveContainer height={350} className="w-full">
        <LineChart data={chartStockData}>
          <XAxis dataKey="day" />
          <YAxis />
          <ReferenceLine x="2020-08-31" stroke="black" />
          <Line dataKey="data" dot={false} stroke="red" />
          <Line dataKey="raw" dot={false} stroke="green" />
          <Line dataKey="target" connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
