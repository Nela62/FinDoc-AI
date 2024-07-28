'use client';

import {
  AreaChart,
  XAxis,
  YAxis,
  Area,
  BarChart,
  Bar,
  ReferenceLine,
  LabelList,
  Rectangle,
} from 'recharts';

import { forwardRef, useEffect, useState } from 'react';
import { DailyStockData } from '@/types/alphaVantageApi';
import { format, getQuarter, getYear, toDate } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { PolygonData } from '@/types/metrics';
import {
  getHighestStockPrice,
  getLatestStockDataPoint,
  getLowestStockPrice,
  getMeanClosingStockPrice,
  getNYearsStock,
} from '@/lib/utils/metrics/stock';

type ChartProps = {
  colors: string[];
  targetPrice: number;
  dailyStock: DailyStockData;
  polygonQuarterly: PolygonData;
  polygonAnnual: PolygonData;
};

const renderCustomizedLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  const low = Math.abs(height) < 10;

  return (
    <g>
      <text
        y={
          low
            ? value < 0
              ? y + height - 4
              : y - 4
            : value < 0
            ? y + height + 8
            : y + height - 6
        }
        // y={y + height + 8}
        x={x + width / 2}
        fill={low ? '#000' : '#fff'}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {value}
      </text>
    </g>
  );
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
  const stockMin = getLowestStockPrice(stockData);
  const stockMax = getHighestStockPrice(stockData);
  const stockMean = getMeanClosingStockPrice(stockData);

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

  const annualEPS = annualSlicedArray.map((arr) =>
    arr
      .reduce(
        (prev, cur) =>
          prev +
            cur.financials.income_statement?.basic_earnings_per_share?.value ??
          0,
        0,
      )
      .toFixed(2),
  );

  const columnsClass = `50px ${quartersList
    .map((q) => q + 'fr')
    .join(' ')}`.trim();

  const CustomBar = (props: any) => {
    const { value } = props;
    let fill = primaryColor;

    if (value < 0) {
      fill = '#991b1b';
    }

    return (
      <Rectangle {...props} fill={fill} className="recharts-bar-rectangle" />
    );
  };

  return (
    <div className="bg-background w-[500px] h-fit" ref={ref}>
      <div
        className="w-[500px] justify-between flex text-foreground/60 pb-2 pr-2"
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
        className="grid divide-x divide-y w-[500px] divide-zinc-400"
        style={{
          fontSize: '8px',
          gridTemplateColumns: columnsClass,
        }}
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
            width={500}
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
              domain={[
                (dataMin: number) => dataMin - 0.1 * (stockMax - stockMin),
                (dataMax: number) => dataMax + 0.1 * (stockMax - stockMin),
              ]}
            />
            <Area
              height={90}
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
        {quartersList.map((_, i) => (
          <div key={uuidv4()}></div>
        ))}
        <div className="relative border-l-none flex h-[50px] w-[500px]">
          <div className="w-[50px] h-[50px] flex flex-col justify-between pl-1">
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
            width={450}
            height={50}
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
            <Bar dataKey="y" shape={CustomBar} isAnimationActive={false}>
              <LabelList dataKey="y" content={renderCustomizedLabel} />
            </Bar>
          </BarChart>
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
        <div className="relative border-l-none flex h-[50px] w-[500px]">
          <div className="w-[50px] h-[50px] flex flex-col justify-between pl-1">
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
            width={450}
            height={50}
            data={revenueData}
            barCategoryGap={0.3}
            margin={{ bottom: 0, left: 0, top: 4, right: 0 }}
          >
            <YAxis tickLine={false} axisLine={false} type="number" hide />
            <Bar dataKey="y" shape={CustomBar} isAnimationActive={false}>
              <LabelList dataKey="y" content={renderCustomizedLabel} />
            </Bar>
          </BarChart>
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
                {(Number(annualRevenue[i]) / 1.0e9).toFixed(2)}
              </p>
            </div>
          ))
          .reverse()}

        <div className="">
          <p className="font-semibold pl-1">FY ends</p>
          <p className="font-semibold pl-1">Dec 31</p>
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
        {/* <div className="text-center">
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
        </div> */}
      </div>
    </div>
  );
});
