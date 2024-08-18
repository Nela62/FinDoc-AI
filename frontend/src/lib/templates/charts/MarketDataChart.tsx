'use client';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { forwardRef, useEffect, useState } from 'react';
import { DailyStockData } from '@/types/alphaVantageApi';
import { format, getQuarter, getTime, getYear, parse, toDate } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { PolygonData } from '@/types/metrics';
import {
  getHighestStockPrice,
  getLatestStockDataPoint,
  getLowestStockPrice,
  getMeanClosingStockPrice,
  getNYearsStock,
} from '@/lib/utils/metrics/stock';
import { hexToRGBA } from '@/lib/utils';

type ChartProps = {
  colors: string[];
  targetPrice: number;
  dailyStock: DailyStockData;
  polygonQuarterly: PolygonData;
  polygonAnnual: PolygonData;
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

const barBaseOptions: Highcharts.Options = {
  title: {
    text: '',
  },
  chart: {
    type: 'column',
    backgroundColor: 'transparent',
    height: 100,
    width: 900,
    spacing: [0, 0, 0, 0],
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
  yAxis: {
    visible: false,
    title: { text: '' },
    type: 'linear',
    labels: { enabled: false },
    lineWidth: 0,
    gridLineWidth: 0,
  },
  credits: { enabled: false },
  tooltip: { enabled: false },
};

export function sliceArrayByProportions<T>(
  proportions: number[],
  data: T[],
): T[][] {
  const totalProportion = proportions.reduce((sum, prop) => sum + prop, 0);
  let startIndex = 0;

  return proportions.map((proportion) => {
    const sliceSize = Math.round((proportion / totalProportion) * data.length);
    const endIndex = Math.min(startIndex + sliceSize, data.length);
    const slice = data.slice(startIndex, endIndex);
    startIndex = endIndex;
    return slice;
  });
}

// const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
// TODO: generate quarters and columns automatically based on date
export const MarketDataChart = forwardRef((props: ChartProps, ref: any) => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }

  const [primaryColor, secondaryColor, accentColor] = props.colors;

  const stockData = getNYearsStock(props.dailyStock, 4);
  const chartStockData = stockData.map((dataPoint) => ({
    day: dataPoint.day,
    data: Number(dataPoint.data['5. adjusted close']),
  }));
  const stockMin = Number(getLowestStockPrice(stockData));
  const stockMax = Number(getHighestStockPrice(stockData));
  const stockMean = Number(getMeanClosingStockPrice(stockData));

  // TODO: add ability to handle revenue in millions
  const revenueData = props.polygonQuarterly
    .slice(0, 16)
    .map((quarter: any) => ({
      x: quarter.end_date,
      y: Number(
        (
          Number(quarter.financials.income_statement?.revenues?.value ?? 0) /
          1e9
        ).toFixed(2),
      ),
    }))
    .reverse();

  const earningsData = props.polygonQuarterly
    .slice(0, 16)
    .map((quarter: any) => ({
      x: quarter.end_date,
      y: Number(
        (
          quarter.financials.income_statement?.basic_earnings_per_share
            ?.value ?? 0
        ).toFixed(2),
      ),
    }))
    .reverse();

  const quarters =
    props.polygonQuarterly.length > 16 ? 16 : props.polygonQuarterly.length;
  const latestQuarter = getQuarter(toDate(props.polygonQuarterly[0].end_date));
  const latestYear = getYear(toDate(props.polygonQuarterly[0].end_date));

  let quartersList = [];

  let left = quarters - latestQuarter;

  quartersList.unshift(latestQuarter);

  while (left) {
    if (left > 4) {
      left -= 4;
      quartersList.unshift(4);
    } else {
      if (left !== 0) {
        quartersList.unshift(left);
      }
      left = 0;
    }
  }

  const annualSlicedArray = sliceArrayByProportions(
    quartersList,
    props.polygonQuarterly.slice(0, 16).reverse(),
  );

  const annualRevenue = annualSlicedArray.map((arr) =>
    (
      arr.reduce(
        (prev, cur) =>
          prev + cur.financials.income_statement?.revenues?.value ?? 0,
        0,
      ) / 1e9
    ).toFixed(2),
  );

  const annualEPS = annualSlicedArray
    .map((arr) =>
      arr
        .reduce(
          (prev, cur) =>
            prev +
              cur.financials.income_statement?.basic_earnings_per_share
                ?.value ?? 0,
          0,
        )
        .toFixed(2),
    )
    .reverse();

  const columnsClass = `100px ${quartersList
    .map((q) => q + 'fr')
    .join(' ')}`.trim();

  const stockOptions = {
    ...lineBaseOptions,

    yAxis: {
      title: { text: '' },
      type: 'linear',
      labels: { style: { fontSize: '14px' } },
      tickPositions: [stockMin, stockMean, stockMax],
      min: Math.max(0, stockMin * 0.8),
      max: stockMax * 1.2,
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
          x: getTime(parse(d.day, 'yyyy-MM-dd', new Date())),
          y: Number(d.data),
        })),
        lineColor: primaryColor,
        fillColor: hexToRGBA(secondaryColor, 0.5),
        lineWidth: 1.5,
      },
    ],
  };

  const epsOptions = {
    ...barBaseOptions,
    series: [
      {
        type: 'column',
        animation: false,
        borderRadius: 0,
        data: earningsData.map((d) => ({
          x: getTime(parse(d.x, 'yyyy-MM-dd', new Date())),
          y: d.y,
          color: d.y < 0 ? '#991b1b' : primaryColor,
        })),
      },
    ],
  };

  const revenueOptions = {
    ...barBaseOptions,
    series: [
      {
        type: 'column',
        animation: false,
        borderRadius: 0,
        data: revenueData.map((d) => ({
          x: getTime(parse(d.x, 'yyyy-MM-dd', new Date())),
          y: d.y,
          color: d.y < 0 ? '#991b1b' : primaryColor,
        })),
      },
    ],
  };

  return (
    <div
      className="bg-background w-[1000px] h-fit border-b border-zinc-400"
      ref={ref}
    >
      <div
        className="w-[1000px] justify-between flex text-foreground/60 pb-4 pr-4"
        style={{ fontSize: '14px' }}
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
        className="grid divide-x divide-y w-[1000px] divide-zinc-400 relative"
        style={{
          fontSize: '16px',
          gridTemplateColumns: columnsClass,
        }}
      >
        <div className="border-t border-l border-zinc-400 leading-snug h-[180px]">
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
          <div className="absolute top-0 left-0">
            <HighchartsReact highcharts={Highcharts} options={stockOptions} />
          </div>
        </div>
        {quartersList.map((_, i) => (
          <div key={uuidv4()}></div>
        ))}
        <div className="relative border-l-none flex h-[100px] w-[1000px]">
          <div className="w-[100px] h-[100px] flex flex-col justify-between pl-2">
            <div className="leading-snug">
              <h2
                style={{ fontSize: '18px' }}
                className="text-foreground font-bold"
              >
                EPS
              </h2>
              <h2
                style={{ fontSize: '14px' }}
                className="text-foreground font-semibold"
              >
                ($)
              </h2>
            </div>
            <p className="font-semibold">Quarterly</p>
          </div>
          <HighchartsReact highcharts={Highcharts} options={epsOptions} />
        </div>
        {quartersList.map((_, i) => (
          <div key={uuidv4()}></div>
        ))}
        {/* <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div> */}
        <div className="flex items-center pl-1">
          <p className="font-semibold">Annual</p>
        </div>
        {...quartersList
          .map((_, i) => (
            <div
              className="flex items-center w-full justify-center"
              key={uuidv4()}
            >
              <p className="font-semibold">{annualEPS[i]}</p>
            </div>
          ))
          .reverse()}
        <div className="relative border-l-none flex h-[100px] w-[1000px]">
          <div className="w-[100px] h-[100px] flex flex-col justify-between pl-2">
            <div className="leading-snug">
              <h2
                style={{ fontSize: '18px' }}
                className="text-foreground font-bold"
              >
                Revenue
              </h2>
              <h2
                style={{ fontSize: '14px' }}
                className="text-foreground font-semibold"
              >
                ($ in Bil.)
              </h2>
            </div>
            <p className="font-semibold">Quarterly</p>
          </div>
          <HighchartsReact highcharts={Highcharts} options={revenueOptions} />
        </div>
        {quartersList.map((_, i) => (
          <div key={uuidv4()}></div>
        ))}
        <div className="flex items-center pl-1">
          <p className="font-semibold">Annual</p>
        </div>
        {...quartersList
          .map((_, i) => (
            <div
              className="flex items-center w-full justify-center"
              key={uuidv4()}
            >
              <p className="font-semibold">
                {Number(annualRevenue[i]).toFixed(2)}
              </p>
            </div>
          ))
          .reverse()}

        <div className="">
          <p className="font-semibold pl-2">FY ends</p>
          <p className="font-semibold pl-2">Dec 31</p>
        </div>
        {...quartersList.map((num, i) => (
          <div className="text-center" key={`${num}${i}`}>
            <div
              className="grid divide-x divide-zinc-400"
              style={{ gridTemplateColumns: `repeat(${num}, 1fr)` }}
            >
              {i === 0
                ? Array.from(Array(num).keys())
                    .reverse()
                    .map((n) => <div key={n}>Q{num - n}</div>)
                : Array.from(Array(num).keys()).map((n) => (
                    <div key={n}>Q{n + 1}</div>
                  ))}
            </div>
            <div className="text-center font-semibold">
              {latestYear - quartersList.length + i + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
