'use client';

import { DAILY_IBM } from '@/lib/data/daily_ibm_full';
import { WEEKLY_IBM } from '@/lib/data/weekly_ibm';
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

type ChartProps = {
  colors: string[];
  targetPrice: number;
  incomeStatement: any;
  earnings: any;
};

// const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
// TODO: generate quarters and columns automatically based on date
export const Chart = forwardRef((props: ChartProps, ref: any) => {
  // Override console.error
  // This is a hack to suppress the warning about missing defaultProps in the recharts library
  // @link https://github.com/recharts/recharts/issues/3615
  const error = console.error;

  console.error = (...args: any) => {
    if (/defaultProps/.test(args[0])) return;
    error(...args);
  };
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    // Returns null on first render, so the client and server match
    return null;
  }

  const [primaryColor, secondaryColor, accentColor] = props.colors;

  const days = 4 * 365 + 1;

  const data = Object.entries(DAILY_IBM['Time Series (Daily)'])
    .map(([key, value]) => ({ x: key, y: Number(value['4. close']) }))
    .slice(0, days)
    .reverse();

  const min = data.reduce((min, p) => (p.y < min ? p.y : min), data[0].y);
  const max = data.reduce((max, p) => (p.y > max ? p.y : max), data[0].y);
  const sum = data.reduce((sum, p) => sum + p.y, 0);
  const mean = sum / data.length;

  const revenueData = props.incomeStatement['quarterlyReports']
    .slice(0, 16)
    .map((quarter: any) => ({
      x: quarter.fiscalDateEnding,
      y: (Number(quarter.totalRevenue) / 1000000000.0).toFixed(2),
    }))
    .reverse();
  const earningsData = props.earnings['quarterlyEarnings']
    .slice(0, 16)
    .map((quarter: any) => ({
      x: quarter.fiscalDateEnding,
      y: quarter.reportedEPS,
    }))
    .reverse();
  return (
    <>
      <div
        className="w-full justify-between flex text-foreground/60 pb-2 pr-2"
        style={{ fontSize: '7px' }}
      >
        <p>200-Day Moving Average</p>
        <div className="flex gap-2">
          <p>Target Price: $165.00</p>
          <p>52 Week High: $143.63</p>
          <p>52 Week Low: $125.92</p>
          <p>Closed at $132.21 on 7/28</p>
        </div>
      </div>
      <div
        className="grid grid-cols-[50px_2fr_4fr_4fr_4fr_2fr] divide-x divide-y w-[477px] divide-zinc-400"
        style={{ fontSize: '8px' }}
        ref={ref}
      >
        <div className="border-t border-l border-zinc-400">
          <h2 style={{ fontSize: '9px' }} className="text-foreground font-bold">
            Price
          </h2>
          <h2
            style={{ fontSize: '7px' }}
            className="text-foreground font-semibold"
          >
            ($)
          </h2>
          <AreaChart
            width={477}
            height={90}
            data={data}
            margin={{ right: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="x"
              tickLine={false}
              tick={false}
              axisLine
              height={1}
              hide
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              type="number"
              width={50}
              ticks={[min, mean.toFixed(2), max]}
              // domain={['dataMin', 'dataMax']}
              domain={[
                (dataMin: number) => dataMin - 20,
                (dataMax: number) => dataMax + 10,
              ]}
            />

            <Area
              type="monotone"
              dataKey="y"
              stroke={primaryColor}
              fill={secondaryColor}
              strokeWidth={1.5}
              isAnimationActive={false}
            />

            <ReferenceLine
              y={min}
              stroke="#3f3f46"
              strokeDasharray="3 3"
              strokeWidth="0.7"
            />
            <ReferenceLine
              y={mean}
              stroke="#3f3f46"
              strokeDasharray="3 3"
              strokeWidth="0.7"
            />
            <ReferenceLine
              y={max}
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
        <div className="relative border-l-none">
          <h2 style={{ fontSize: '9px' }} className="text-foreground font-bold">
            EPS
          </h2>
          <h2
            style={{ fontSize: '7px' }}
            className="text-foreground font-semibold"
          >
            ($)
          </h2>
          <div className="absolute bottom-0 left-0">
            <p className="font-semibold">Quarterly</p>
          </div>
          <BarChart
            width={477}
            height={44}
            data={earningsData}
            barCategoryGap={0.3}
            margin={{ left: 50 }}
            className="mt-[-18px]"
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
        <div className="">
          <p className="font-semibold">Annual</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">3.24</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">1.22</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">5.22</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">4.22</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">4.22</p>
        </div>
        <div className="relative">
          <h2 style={{ fontSize: '9px' }} className="text-foreground font-bold">
            Revenue
          </h2>
          <h2
            style={{ fontSize: '7px' }}
            className="text-foreground font-semibold"
          >
            ($ in Bil.)
          </h2>

          <BarChart
            width={477}
            height={44}
            data={revenueData}
            barCategoryGap={0.3}
            margin={{ left: 50 }}
            className="mt-[-18px]"
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
        <div className="">
          <p className="font-semibold">Annual</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">3.24</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">1.22</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">5.22</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">4.22</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">4.22</p>
        </div>
        <div className="">
          <p className="font-semibold">FY ends</p>
          <p className="font-semibold">Dec 31</p>
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
            <div>Q3</div>
            <div>Q4</div>
          </div>
          <div className="text-center font-semibold">2024</div>
        </div>
      </div>
    </>
  );
});
