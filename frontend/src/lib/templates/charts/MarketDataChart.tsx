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

type ChartProps = {
  colors: string[];
  targetPrice: number;
  incomeStatement: IncomeStatement;
  earnings: Earnings;
  dailyStock: DailyStockData;
};

// const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
// TODO: generate quarters and columns automatically based on date
export const MarketDataChart = forwardRef((props: ChartProps, ref: any) => {
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

  const stockData = getNYearsStock(props.dailyStock, 4);
  const chartStockData = stockData.map((dataPoint) => ({
    day: dataPoint.day,
    data: dataPoint.data['5. adjusted close'],
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

  return (
    <div className="bg-background w-[477px] h-fit" ref={ref}>
      <div
        className="w-[477px] justify-between flex text-foreground/60 pb-2 pr-2"
        style={{ fontSize: '7px' }}
      >
        <p>200-Day Moving Average</p>
        <div className="flex gap-2">
          <p>Target Price: ${props.targetPrice}</p>
          <p>
            52 Week High: $
            {stockMax.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p>
            52 Week Low: $
            {stockMin.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p>
            Closed at{' '}
            {Number(
              getLatestStockDataPoint(stockData)?.data['5. adjusted close'],
            ).toFixed(2)}{' '}
            on {format(new Date(), 'M/d')}
          </p>
        </div>
      </div>
      <div
        className="grid grid-cols-[50px_2fr_4fr_4fr_4fr_2fr] divide-x divide-y w-[477px] divide-zinc-400"
        style={{ fontSize: '8px' }}
      >
        <div className="border-t border-l border-zinc-400 leading-snug">
          <h2
            style={{ fontSize: '9px' }}
            className="text-foreground font-bold pl-1"
          >
            Price
          </h2>
          <h2
            style={{ fontSize: '7px' }}
            className="text-foreground font-semibold pl-1"
          >
            ($)
          </h2>
          <AreaChart
            width={477}
            height={90}
            data={chartStockData}
            margin={{ right: 0, bottom: 0 }}
            className="mt-[-14px]"
          >
            <XAxis
              dataKey="day"
              tickLine={false}
              tick={false}
              axisLine
              height={1}
              hide
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              dataKey="data"
              type="number"
              width={50}
              ticks={[
                Number(stockMin.toFixed(2)),
                stockMean,
                Number(stockMax.toFixed(2)),
              ]}
              // domain={['dataMin', 'dataMax']}
              domain={[
                (dataMin: number) => dataMin - 20,
                (dataMax: number) => dataMax + 10,
              ]}
            />
            <Area
              type="monotone"
              dataKey="data"
              stroke={primaryColor}
              fill={secondaryColor}
              strokeWidth={1.5}
              isAnimationActive={false}
            />

            <ReferenceLine
              y={stockMin}
              stroke="#3f3f46"
              strokeDasharray="3 3"
              strokeWidth="0.7"
            />
            <ReferenceLine
              y={stockMean}
              stroke="#3f3f46"
              strokeDasharray="3 3"
              strokeWidth="0.7"
            />
            <ReferenceLine
              y={stockMax}
              stroke="#3f3f46"
              strokeDasharray="3 3"
              strokeWidth="0.7"
            />
            {/* <ReferenceDot
              x={data[data.length - 1].x}
              y={props.targetPrice}
              label={props.targetPrice}
              fill={accentColor}
            /> */}
          </AreaChart>
        </div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div className="relative border-l-none flex h-[44px] w-[477px]">
          <div className="w-[50px] h-[44px] flex flex-col justify-between pl-1">
            <div className="leading-snug">
              <h2
                style={{ fontSize: '9px' }}
                className="text-foreground font-bold"
              >
                EPS
              </h2>
              <h2
                style={{ fontSize: '7px' }}
                className="text-foreground font-semibold"
              >
                ($)
              </h2>
            </div>

            <p className="font-semibold">Quarterly</p>
          </div>
          <BarChart
            width={427}
            height={44}
            data={earningsData}
            barCategoryGap={0.3}
            margin={{ bottom: 0, left: 0, top: 4, right: 0 }}
          >
            <YAxis
              width={0}
              tickLine={false}
              axisLine={false}
              type="number"
              domain={['dataMin', 'dataMax']}
              hide
            />
            <Bar
              dataKey="y"
              fill={primaryColor}
              label={{ fill: 'white', position: 'insideBottom', fontSize: 7 }}
              isAnimationActive={false}
            />
          </BarChart>
        </div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div className="flex items-center pl-1">
          <p className="font-semibold">Annual</p>
        </div>
        <div className="flex items-center w-full justify-center">
          <p className="font-semibold">
            {props.earnings.annualEarnings[4].reportedEPS}
          </p>
        </div>
        <div className="flex items-center w-full justify-center">
          <p className="font-semibold">
            {props.earnings.annualEarnings[3].reportedEPS}
          </p>
        </div>
        <div className="flex items-center w-full justify-center">
          <p className="font-semibold">
            {props.earnings.annualEarnings[2].reportedEPS}
          </p>
        </div>
        <div className="flex items-center w-full justify-center">
          <p className="font-semibold">
            {props.earnings.annualEarnings[1].reportedEPS}
          </p>
        </div>
        <div className="flex items-center w-full justify-center">
          <p className="font-semibold">
            {props.earnings.annualEarnings[0].reportedEPS}
          </p>
        </div>
        <div className="relative border-l-none flex h-[44px] w-[477px]">
          <div className="w-[50px] h-[44px] flex flex-col justify-between pl-1">
            <div className="leading-snug">
              <h2
                style={{ fontSize: '9px' }}
                className="text-foreground font-bold"
              >
                Revenue
              </h2>
              <h2
                style={{ fontSize: '7px' }}
                className="text-foreground font-semibold"
              >
                ($ in Bil.)
              </h2>
            </div>
            <p className="font-semibold">Quarterly</p>
          </div>
          <BarChart
            width={427}
            height={44}
            data={revenueData}
            barCategoryGap={0.3}
            margin={{ bottom: 0, left: 0, top: 4, right: 0 }}
          >
            <YAxis tickLine={false} axisLine={false} type="number" hide />
            <Bar
              dataKey="y"
              fill={primaryColor}
              label={{ fill: 'white', position: 'insideBottom', fontSize: 7 }}
              isAnimationActive={false}
            />
          </BarChart>
        </div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div className="flex items-center pl-1">
          <p className="font-semibold">Annual</p>
        </div>
        <div className="flex items-center w-full justify-center">
          <p className="font-semibold">
            {(
              Number(props.incomeStatement.annualReports[4].totalRevenue) /
              1.0e9
            ).toFixed(2)}
          </p>
        </div>
        <div className="flex items-center w-full justify-center">
          <p className="font-semibold">
            {(
              Number(props.incomeStatement.annualReports[3].totalRevenue) /
              1.0e9
            ).toFixed(2)}
          </p>
        </div>
        <div className="flex items-center w-full justify-center">
          <p className="font-semibold">
            {(
              Number(props.incomeStatement.annualReports[2].totalRevenue) /
              1.0e9
            ).toFixed(2)}
          </p>
        </div>
        <div className="flex items-center w-full justify-center">
          <p className="font-semibold">
            {(
              Number(props.incomeStatement.annualReports[1].totalRevenue) /
              1.0e9
            ).toFixed(2)}
          </p>
        </div>
        <div className="flex items-center w-full justify-center">
          <p className="font-semibold">
            {(
              Number(props.incomeStatement.annualReports[0].totalRevenue) /
              1.0e9
            ).toFixed(2)}
          </p>
        </div>
        <div className="">
          <p className="font-semibold pl-1">FY ends</p>
          <p className="font-semibold pl-1">Dec 31</p>
        </div>
        <div className="text-center">
          <div className="grid grid-cols-2 divide-x divide-zinc-400">
            <div>Q3</div>
            <div>Q4</div>
          </div>
          <div className="text-center font-semibold">2020</div>
        </div>
        <div className="text-center">
          <div className="grid grid-cols-4 divide-x divide-zinc-400">
            <div>Q1</div>
            <div>Q2</div>
            <div>Q3</div>
            <div>Q4</div>
          </div>
          <div className="text-center font-semibold">2021</div>
        </div>
        <div className="text-center">
          <div className="grid grid-cols-4 divide-x divide-zinc-400">
            <div>Q1</div>
            <div>Q2</div>
            <div>Q3</div>
            <div>Q4</div>
          </div>
          <div className="text-center font-semibold">2022</div>
        </div>
        <div className="text-center">
          <div className="grid grid-cols-4 divide-x divide-zinc-400">
            <div>Q1</div>
            <div>Q2</div>
            <div>Q3</div>
            <div>Q4</div>
          </div>
          <div className="text-center font-semibold">2023</div>
        </div>
        <div className="text-center">
          <div className="grid grid-cols-2 divide-x divide-zinc-400">
            <div>Q1</div>
            <div>Q2</div>
          </div>
          <div className="text-center font-semibold">2024</div>
        </div>
      </div>
    </div>
  );
});
