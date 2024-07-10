import {
  fetchReportById,
  fetchTemplateConfig,
  getApiCacheByReportId,
} from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import { DailyStockData } from '@/types/alphaVantageApi';
import { PolygonData } from '@/types/metrics';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { useEffect, useState } from 'react';

type LoadingData = {
  isLoading: true;
};

type LoadedData = {
  isLoading: false;
  polygonAnnual: PolygonData;
  polygonQuarterly: PolygonData;
  dailyStock: DailyStockData;
  colors: string[];
};

export const useImageData = (reportId: string): LoadingData | LoadedData => {
  const [apiData, setApiData] = useState({
    polygonAnnual: null,
    polygonQuarterly: null,
  });

  const supabase = createClient();

  const { data: apiCache } = useQuery(
    getApiCacheByReportId(supabase, reportId),
  );

  const { data: templateConfig } = useQuery(
    fetchTemplateConfig(supabase, reportId),
  );

  const { data: report } = useQuery(fetchReportById(supabase, reportId));

  useEffect(() => {
    if (!report) return;

    fetch(`/api/metrics/${report.company_ticker}`)
      .then((res) => res.ok && res.json())
      .then((data) => {
        setApiData({
          polygonAnnual: data.polygonAnnual,
          polygonQuarterly: data.polygonQuarterly,
        });
      })
      .catch((err) => console.error(err));
  }, [report]);

  if (
    !apiCache ||
    !templateConfig ||
    !apiData.polygonAnnual ||
    !apiData.polygonQuarterly
  ) {
    return { isLoading: true };
  }

  return {
    colors: templateConfig.color_scheme,
    dailyStock: apiCache.stock as DailyStockData,
    polygonAnnual: apiData.polygonAnnual as PolygonData,
    polygonQuarterly: apiData.polygonQuarterly as PolygonData,
    isLoading: false,
  };
};
