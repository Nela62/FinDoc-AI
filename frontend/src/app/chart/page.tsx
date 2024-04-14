'use client';

import { DAILY_IBM } from '@/lib/data/daily_ibm_full';
import { WEEKLY_IBM } from '@/lib/data/weekly_ibm';
import { AreaChart, Line, XAxis, YAxis, Area, BarChart, Bar } from 'recharts';

import { useEffect, useState } from 'react';
import { INCOME_STATEMENT_IBM } from '@/lib/data/income_statement_ibm';
import { EARNINGS_IBM } from '@/lib/data/earnings_ibm';

// const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function Chat({}) {
  // Override console.error
  // This is a hack to suppress the warning about missing defaultProps in the recharts library
  // @link https://github.com/recharts/recharts/issues/3615
  const error = console.error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.error = (...args: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    if (/defaultProps/.test(args[0])) return;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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

  const data = Object.entries(DAILY_IBM['Time Series (Daily)']).map(
    ([key, value]) => ({ x: key, y: Number(value['4. close']) }),
  );
  const weeklyData = Object.entries(WEEKLY_IBM['Weekly Time Series']).map(
    ([key, value]) => ({ x: key, y: Number(value['4. close']) }),
  );
  const revenueData = INCOME_STATEMENT_IBM['quarterlyReports']
    .slice(0, 16)
    .map((quarter) => ({
      x: quarter.fiscalDateEnding,
      y: (Number(quarter.totalRevenue) / 1000000000.0).toFixed(2),
    }))
    .reverse();
  const earningsData = EARNINGS_IBM['quarterlyEarnings']
    .slice(0, 16)
    .map((quarter) => ({
      x: quarter.fiscalDateEnding,
      y: quarter.reportedEPS,
    }))
    .reverse();

  const days = 4 * 365 + 1;
  const weeks = 4 * 52;

  return (
    <div
      className="h-screen w-screen flex flex-col gap-3 justify-center items-center bg-white"
      style={{ fontSize: '8px' }}
    >
      {/* https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&outputsize=full&apikey=demo */}
      <AreaChart
        width={484}
        height={92.16}
        data={data.slice(0, days).reverse()}
      >
        <XAxis dataKey="x" hide />
        <YAxis
          tickLine={false}
          axisLine={false}
          type="number"
          // domain={['dataMin', 'dataMax']}
          domain={[
            (dataMin: number) => dataMin - 20,
            (dataMax: number) => dataMax + 20,
          ]}
        />
        {/* <CartesianGrid stroke="#eee" strokeDasharray="5 5" /> */}
        <Area
          type="monotone"
          dataKey="y"
          stroke="#1f497d"
          fill="#f4e9d3"
          strokeWidth={1.5}
        />
        {/* <Line type="monotone" dataKey="y" stroke="#8884d8" /> */}
      </AreaChart>
      {/* https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=IBM&apikey=demo */}
      <AreaChart
        width={484}
        height={92.16}
        data={weeklyData.slice(0, weeks).reverse()}
      >
        <XAxis dataKey="x" hide />
        <YAxis
          tickLine={false}
          axisLine={false}
          type="number"
          // domain={['dataMin', 'dataMax']}
          domain={[
            (dataMin: number) => dataMin - 20,
            (dataMax: number) => dataMax + 20,
          ]}
        />
        {/* <CartesianGrid stroke="#eee" strokeDasharray="5 5" /> */}
        <Area
          type="monotone"
          dataKey="y"
          stroke="#1f497d"
          fill="#f4e9d3"
          strokeWidth={1.5}
        />
        {/* <Line type="monotone" dataKey="y" stroke="#8884d8" /> */}
      </AreaChart>
      {/* https://www.alphavantage.co/query?function=EARNINGS&symbol=IBM&apikey=demo */}
      <BarChart
        width={484}
        height={44}
        data={earningsData}
        barCategoryGap={0.3}
      >
        <YAxis tickLine={false} axisLine={false} type="number" />
        <Bar
          dataKey="y"
          fill="#1f497d"
          label={{ fill: 'white', position: 'insideBottom', fontSize: 7 }}
        />
      </BarChart>
      {/* TODO: label should become black if bar height is low */}
      {/* https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=IBM&apikey=demo */}
      <BarChart width={484} height={44} data={revenueData} barCategoryGap={0.3}>
        <YAxis tickLine={false} axisLine={false} type="number" />
        <Bar
          dataKey="y"
          fill="#1f497d"
          label={{ fill: 'white', position: 'insideBottom', fontSize: 7 }}
        />
      </BarChart>
    </div>
  );
}
