'use client';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { forwardRef, useEffect, useState } from 'react';
import { DailyStockData } from '@/types/alphaVantageApi';
import { format, getTime, parse } from 'date-fns';
import {
  getHighestStockPrice,
  getLatestStockDataPoint,
  getLowestStockPrice,
  getMeanClosingStockPrice,
  getNMonthsStock,
} from '@/lib/utils/metrics/stock';
import { hexToRGBA } from '@/lib/utils';

type ChartProps = {
  colors: string[];
  targetPrice: number;
  dailyStock: DailyStockData;
};

const lineBaseOptions: Highcharts.Options = {
  title: {
    text: '',
  },
  chart: {
    type: 'line',
    backgroundColor: 'transparent',
    height: 180,
    width: 1000,
    spacing: [0, 0, 0, 44],
    borderWidth: 0,
  },
  legend: {
    enabled: false,
  },
  plotOptions: {
    column: {
      pointPadding: 0,
      groupPadding: 0.02,
      borderWidth: 0,
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '14px',
          fontWeight: 'normal',
          textOutline: 'none',
        },
        padding: 3,
      },
    },
  },
  xAxis: {
    visible: false,
    type: 'datetime',
    tickmarkPlacement: 'on',
    minPadding: 0,
    maxPadding: 0,
    lineWidth: 0,
  },
  credits: { enabled: false },
  tooltip: { enabled: false },
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

  console.log('generating quarter stock chart');

  const stockData = getNMonthsStock(props.dailyStock, 1);

  const chartStockData = stockData.map((dataPoint) => ({
    day: dataPoint.day.slice(5),
    data: Number(dataPoint.data['5. adjusted close']),
  }));

  const stockMin = Number(getLowestStockPrice(stockData));
  const stockMax = Number(getHighestStockPrice(stockData));
  const stockMean = Number(getMeanClosingStockPrice(stockData));

  const stockOptions = {
    ...lineBaseOptions,
    yAxis: {
      title: { text: '' },
      type: 'linear',
      labels: { style: { fontSize: '14px' } },
      tickPositions: [stockMin, stockMean, stockMax],
      min: stockMin * 0.99,
      max: stockMax * 1.01,
      startOnTick: false,
      endOnTick: false,
      gridLineDashStyle: 'Dash',
    },
    series: [
      {
        type: 'area',
        animation: false,
        borderRadius: 0,
        data: chartStockData.map((d) => ({
          x: getTime(parse(d.day, 'MM-dd', new Date())),
          y: Number(d.data),
        })),
        lineColor: primaryColor,
        fillColor: hexToRGBA(secondaryColor, 0.5),
        lineWidth: 1.5,
        marker: {
          enabled: false,
        },
      },
    ],
  };

  return (
    <div className="bg-background w-[1000px] h-fit" ref={ref}>
      <div
        className="w-[1000px] justify-between flex text-foreground/60 pb-4 pr-4"
        style={{ fontSize: '14px' }}
      >
        <p>30-Day Moving Average</p>
        <div className="flex gap-2">
          <p>Target Price: ${props.targetPrice}</p>
          <p>30 Days High: ${stockMin.toFixed(2)}</p>
          <p>30 Days Low: ${stockMax.toFixed(2)}</p>
          <p>
            Closed at{' '}
            {Number(
              getLatestStockDataPoint(stockData)?.data['5. adjusted close'],
            ).toFixed(2)}{' '}
            on {format(new Date(), 'M/d')}
          </p>
        </div>
      </div>
      <div className="w-[1000px] " style={{ fontSize: '16px' }}>
        <div className="leading-snug">
          <h2
            style={{ fontSize: '18px' }}
            className="text-foreground font-bold pl-2"
          >
            Price
          </h2>
          <h2
            style={{ fontSize: '14px' }}
            className="text-foreground font-semibold pl-2"
          >
            ($)
          </h2>

          <HighchartsReact highcharts={Highcharts} options={stockOptions} />
        </div>
      </div>
    </div>
  );
});
