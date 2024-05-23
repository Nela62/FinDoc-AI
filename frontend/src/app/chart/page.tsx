'use client';

import { DAILY_IBM } from '@/lib/data/daily_ibm_full';
import { WEEKLY_IBM } from '@/lib/data/weekly_ibm';
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
import { Chart } from '@/components/Toolbar/components/export/components/Chart';
import { DAILY_STOCK_IBM } from '@/lib/data/daily_stock_ibm';

// const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
// TODO: generate quarters and columns automatically based on date
export default function ChartPage() {
  return (
    <Chart
      colors={['#1c4587', '#f4e9d3', '#006f3b']}
      targetPrice={168}
      incomeStatement={INCOME_STATEMENT_IBM}
      earnings={EARNINGS_IBM}
      dailyStock={DAILY_STOCK_IBM}
    />
  );
}
