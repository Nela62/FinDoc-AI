import { DailyStockData } from '@/types/alphaVantageApi';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { QuarterStockChart } from './QuarterStockChart';
import { MarketDataChart } from './MarketDataChart';
import { toPng } from 'html-to-image';
import { PolygonData } from '@/types/metrics';

export const ChartWrapper = ({
  colors,
  targetPrice,
  dailyStock,
  setCharts,
  polygonAnnual,
  polygonQuarterly,
}: {
  colors: string[];
  targetPrice: number;
  dailyStock: DailyStockData;
  polygonAnnual: PolygonData;
  polygonQuarterly: PolygonData;
  setCharts: Dispatch<SetStateAction<Blob[] | null>>;
}) => {
  const [stockChart, setStockChart] = useState<HTMLDivElement | null>(null);
  const [marketChart, setMarketChart] = useState<HTMLDivElement | null>(null);

  const onStockRefChange = useCallback((node: HTMLDivElement) => {
    setStockChart(node);
  }, []);

  const onMarketRefChange = useCallback((node: HTMLDivElement) => {
    setMarketChart(node);
  }, []);

  const getImgBlob = useCallback(
    async (element: HTMLDivElement) =>
      await toPng(element)
        .then((url) => fetch(url))
        .then((res) => res.blob()),
    [],
  );

  const getImages = useCallback(
    async (stockChart: HTMLDivElement, marketChart: HTMLDivElement) => {
      const stockChartBlob = await getImgBlob(stockChart);
      const marketChartBlob = await getImgBlob(marketChart);
      return [stockChartBlob, marketChartBlob];
    },
    [getImgBlob],
  );

  useEffect(() => {
    if (stockChart && marketChart) {
      console.log('set new images');
      getImages(stockChart, marketChart).then((images) => setCharts(images));
    }
  }, [setCharts, stockChart, marketChart, getImages, colors]);

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
        polygonQuarterly={polygonQuarterly}
        polygonAnnual={polygonAnnual}
        dailyStock={dailyStock}
        ref={onMarketRefChange}
      />
    </div>
  );
};
