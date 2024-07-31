'use client';

import {
  AreaChart,
  Line,
  XAxis,
  YAxis,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  ReferenceLine,
} from 'recharts';

import { Suspense, useEffect, useState } from 'react';
import { MarketDataChart } from '@/lib/templates/charts/MarketDataChart';
import { DAILY_IBM } from '@/lib/data/daily_ibm';
import { TargetPriceChart } from '@/lib/templates/charts/TargetPriceChart';
import { QuarterStockChart } from '@/lib/templates/charts/QuarterStockChart';
import { POLYGON_ANNUAL } from '@/lib/data/polygon_annual';
import { POLYGON_QUARTERLY } from '@/lib/data/polygon_quarterly';

// TODO: generate quarters and columns automatically based on date
export default function ChartPage() {
  return (
    <Suspense>
      <MarketDataChart
        colors={['#1c4587', '#f4e9d3', '#006f3b']}
        targetPrice={168}
        dailyStock={DAILY_IBM}
        polygonAnnual={POLYGON_ANNUAL}
        polygonQuarterly={POLYGON_QUARTERLY}
      />
    </Suspense>
  );
}
