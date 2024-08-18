import { DailyStockData } from '@/types/alphaVantageApi';
import {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { QuarterStockChart } from './QuarterStockChart';
import { MarketDataChart } from './MarketDataChart';
import { toPng } from 'html-to-image';
import { PolygonData } from '@/types/metrics';

const MemoizedMarketDataChart = memo(MarketDataChart);
const MemoizedQuarterStockChart = memo(QuarterStockChart);

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

  const prevColorsRef = useRef(colors);

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
    if (
      stockChart &&
      marketChart &&
      JSON.stringify(prevColorsRef.current) !== JSON.stringify(colors)
    ) {
      console.log('Colors changed, updating images');
      getImages(stockChart, marketChart).then((images) => setCharts(images));
      prevColorsRef.current = colors;
    }
  }, [colors, stockChart, marketChart, getImages, setCharts]);

  useEffect(() => {
    if (stockChart && marketChart) {
      console.log('set new images');
      getImages(stockChart, marketChart).then((images) => setCharts(images));
    }
  }, [setCharts, stockChart, marketChart, getImages]);

  return (
    <div className="sr-only">
      <MemoizedQuarterStockChart
        colors={colors}
        targetPrice={targetPrice}
        dailyStock={dailyStock}
        ref={onStockRefChange}
      />
      <MemoizedMarketDataChart
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
