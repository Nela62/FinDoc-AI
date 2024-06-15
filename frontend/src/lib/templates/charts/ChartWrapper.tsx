import {
  DailyStockData,
  Earnings,
  IncomeStatement,
} from '@/types/alphaVantageApi';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { QuarterStockChart } from './QuarterStockChart';
import { MarketDataChart } from './MarketDataChart';

export const ChartWrapper = ({
  colors,
  targetPrice,
  dailyStock,
  incomeStatement,
  earnings,
  setCharts,
}: {
  colors: string[];
  targetPrice: number;
  dailyStock: DailyStockData;
  incomeStatement: IncomeStatement;
  earnings: Earnings;
  setCharts: Dispatch<SetStateAction<HTMLDivElement[] | null>>;
}) => {
  const [stockChart, setStockChart] = useState<HTMLDivElement | null>(null);
  const [marketChart, setMarketChart] = useState<HTMLDivElement | null>(null);

  const onStockRefChange = useCallback((node: HTMLDivElement) => {
    setStockChart(node);
  }, []);

  const onMarketRefChange = useCallback((node: HTMLDivElement) => {
    setMarketChart(node);
  }, []);

  useEffect(() => {
    if (stockChart && marketChart) {
      setCharts([stockChart, marketChart]);
    }
  }, [stockChart, marketChart, setCharts]);

  return (
    <div className="sr-only">
      <QuarterStockChart
        colors={colors}
        targetPrice={targetPrice}
        dailyStock={dailyStock}
        ref={onStockRefChange}
      />
      <MarketDataChart
        colors={colors}
        targetPrice={targetPrice}
        incomeStatement={incomeStatement}
        earnings={earnings}
        dailyStock={dailyStock}
        ref={onMarketRefChange}
      />
    </div>
  );
};
