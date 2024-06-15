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

import { useEffect, useState } from 'react';
import { INCOME_STATEMENT_IBM } from '@/lib/data/income_statement_ibm';
import { EARNINGS_IBM } from '@/lib/data/earnings_ibm';
import { MarketDataChart } from '@/lib/templates/charts/MarketDataChart';
import { DAILY_IBM } from '@/lib/data/daily_imb';
import { TargetPriceChart } from '@/lib/templates/charts/TargetPriceChart';
import { QuarterStockChart } from '@/lib/templates/charts/QuarterStockChart';

// TODO: generate quarters and columns automatically based on date
export default function ChartPage() {
  return (
    <MarketDataChart
      colors={['#1c4587', '#f4e9d3', '#006f3b']}
      targetPrice={168}
      incomeStatement={INCOME_STATEMENT_IBM}
      earnings={EARNINGS_IBM}
      dailyStock={DAILY_IBM}
    />
  );
}
