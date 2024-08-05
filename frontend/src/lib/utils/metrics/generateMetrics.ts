import { getTopBarMetrics } from './topBarMetrics';
import { getSidebarMetrics } from './sidebarMetrics';
import { getGrowthAndValuationAnalysisMetrics } from './growthAndValuationAnalysisMetrics';
import { getFinancialAndRiskAnalysisMetrics } from './financialAndRiskAnalysisMetrics';
import { getNWeeksStock } from './stock';
import { ApiData } from '@/app/(protected)/reports/components/report/ReportForm';
import { TemplateConfig } from '@/types/template';

export function generateMetrics(
  apiData: ApiData,
  targetPrice: number,
  financialStrength: string,
) {
  const { overview, dailyStock, yfAnnual, yfQuarterly } = apiData;

  const topBarMetrics = getTopBarMetrics(
    overview,
    targetPrice,
    getNWeeksStock(dailyStock),
    yfQuarterly,
  );

  const sidebarMetrics = getSidebarMetrics(
    overview,
    getNWeeksStock(dailyStock),
    targetPrice,
    financialStrength,
    yfQuarterly,
  );

  const growthAndValuationAnalysisMetrics =
    getGrowthAndValuationAnalysisMetrics(yfAnnual, dailyStock);
  const financialAndRiskAnalysisMetrics =
    getFinancialAndRiskAnalysisMetrics(yfAnnual);

  return {
    topBarMetrics,
    sidebarMetrics,
    growthAndValuationAnalysisMetrics,
    financialAndRiskAnalysisMetrics,
  };
}
