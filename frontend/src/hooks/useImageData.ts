import { fetchAPICacheByReportId, fetchTemplateConfig } from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import {
  DailyStockData,
  Earnings,
  IncomeStatement,
} from '@/types/alphaVantageApi';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';

type LoadingData = {
  isLoading: true;
};

type LoadedData = {
  isLoading: false;
  incomeStatement: IncomeStatement;
  earnings: Earnings;
  dailyStock: DailyStockData;
  colors: string[];
};

export const useImageData = (reportId: string): LoadingData | LoadedData => {
  const supabase = createClient();

  const { data: apiCache } = useQuery(
    fetchAPICacheByReportId(supabase, reportId),
  );

  const { data: templateConfig } = useQuery(
    fetchTemplateConfig(supabase, reportId),
  );

  if (!apiCache || !templateConfig) {
    return { isLoading: true };
  }

  return {
    colors: templateConfig.color_scheme,
    dailyStock: apiCache.find((cache) =>
      cache.endpoint.includes('TIME_SERIES_DAILY'),
    )!.json_data as DailyStockData,
    incomeStatement: apiCache.find((cache) =>
      cache.endpoint.includes('INCOME_STATEMENT'),
    )!.json_data as IncomeStatement,
    earnings: apiCache.find((cache) => cache.endpoint.includes('EARNINGS'))!
      .json_data as Earnings,
    isLoading: false,
  };
};
