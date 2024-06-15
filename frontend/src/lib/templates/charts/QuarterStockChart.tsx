'use client';

import { AreaChart, XAxis, YAxis, Area, ReferenceLine } from 'recharts';

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
  getNMonthsStock,
} from '@/lib/utils/financialAPI';
import { format } from 'date-fns';

type ChartProps = {
  colors: string[];
  targetPrice: number;
  dailyStock: DailyStockData;
};

// const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
// TODO: generate quarters and columns automatically based on date
export const QuarterStockChart = forwardRef((props: ChartProps, ref: any) => {
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

  const stockData = getNMonthsStock(props.dailyStock, 1);
  const chartStockData = stockData.map((dataPoint) => ({
    day: dataPoint.day,
    data: dataPoint.data['5. adjusted close'],
  }));
  const stockMin = getLowestClosingStockPrice(stockData);
  const stockMax = getHighestClosingStockPrice(stockData);
  const stockMean = getMeanClosingStockPrice(stockData);

  return (
    <div className="bg-background w-[477px] h-fit" ref={ref}>
      <div
        className="w-[477px] justify-between flex text-foreground/60 pb-2 pr-2"
        style={{ fontSize: '7px' }}
      >
        <p>30-Day Moving Average</p>
        <div className="flex gap-2">
          <p>Target Price: ${props.targetPrice}</p>
          <p>
            30 DaysHigh: $
            {stockMax.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p>
            30 DaysLow: $
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
      <div className="w-[477px] " style={{ fontSize: '8px' }}>
        <div className="leading-snug">
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
            height={120}
            data={chartStockData}
            margin={{ right: 0, bottom: 0 }}
            className="mt-[-14px]"
          >
            <XAxis
              dataKey="day"
              // tickLine={false}
              // tick={false}
              axisLine
              height={20}
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
              type="linear"
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
      </div>
    </div>
  );
});
