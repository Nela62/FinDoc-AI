import { TEMPLATES } from '@/lib/templates';
import { TemplateConfig, TemplateData } from '../Component';
import {
  TopBarMetric,
  getFinancialAndRiskAnalysisMetrics,
  getGrowthAndValuationAnalysisMetrics,
  getNWeeksStock,
  getSidebarMetrics,
  getTopBarMetrics,
} from '@/lib/utils/financialAPI';
import { OVERVIEW } from '@/lib/data/overview_ibm';
import { BALANCE_SHEET_IBM } from '@/lib/data/balance_sheet_ibm';
import { INCOME_STATEMENT_IBM } from '@/lib/data/income_statement_ibm';
import { CASHFLOW_IBM } from '@/lib/data/cashflow_ibm';
import { EARNINGS_IBM } from '@/lib/data/earnings_ibm';
import { JSONContent } from '@tiptap/core';
import { SidebarMetrics } from '@/lib/templates/metrics/components/statistics';
import { AnalysisMetrics } from '@/lib/templates/docxTables/financialAnalysisTable';
import { FinancialStrength, Recommendation } from '@/types/report';
import { Overview } from '@/types/alphaVantageApi';
import { DAILY_IBM } from '@/lib/data/daily_imb';

export const getTemplateDocxBlob = async (
  templateData: TemplateData,
  templateConfig: TemplateConfig,
  authorCompanyLogo: Blob,
  companyLogo: Blob,
  firstPageVisual: Blob,
) => {
  if (!TEMPLATES.hasOwnProperty(templateData.componentId)) {
    throw new Error("Template with this component id doesn't exist");
  }

  // ({ content, colors, twoColumn, authors, authorCompanyName, authorCompanyLogo, createdAt, companyName, companyTicker, companyLogo, summary, businessDescription, sidebarMetrics, growthAndValuationAnalysisMetrics, financialAndRiskAnalysisMetrics, ratings, recommendation, financialStrength, targetPrice, firstPageVisual, secondPageVisual, lastPageVisual, }: EquityAnalystSidebarProps & TemplateConfig)
  const templateFn = TEMPLATES[templateData.componentId];

  try {
    console.log('docxBlob');
    const docxBlob = await templateFn({
      content: templateData.sampleText,
      colors: templateConfig.colorScheme.colors,
      twoColumn: true,
      authors: [templateConfig.authorName],
      authorCompanyName: templateConfig.authorCompanyName,
      authorCompanyLogo: authorCompanyLogo,
      createdAt: new Date(),
      companyName: 'Acme Industries, Inc.',
      companyTicker: 'ACME',
      companyLogo: companyLogo,
      summary: templateData.summary ?? [],
      businessDescription: templateData.businessDescription ?? '',
      topBarMetrics: getTopBarMetrics(OVERVIEW, 182, getNWeeksStock(DAILY_IBM)),
      sidebarMetrics: getSidebarMetrics(
        OVERVIEW,
        BALANCE_SHEET_IBM,
        INCOME_STATEMENT_IBM,
        getNWeeksStock(DAILY_IBM),
        182,
        'HIGH',
      ),
      growthAndValuationAnalysisMetrics: getGrowthAndValuationAnalysisMetrics(
        BALANCE_SHEET_IBM,
        CASHFLOW_IBM,
        INCOME_STATEMENT_IBM,
        EARNINGS_IBM,
        DAILY_IBM,
      ),
      financialAndRiskAnalysisMetrics: getFinancialAndRiskAnalysisMetrics(
        BALANCE_SHEET_IBM,
        CASHFLOW_IBM,
        INCOME_STATEMENT_IBM,
      ),
      ratings: [
        {
          name: '12-month',
          list: ['SELL', 'UW', 'HOLD', 'OW', 'BUY'],
          current: 'BUY',
        },
        {
          name: 'Financial Strength',
          list: ['LOW', 'LM', 'MED', 'MH', 'HIGH'],
          current: 'HIGH',
        },
      ],
      recommendation: 'Buy',
      financialStrength: 'High',
      targetPrice: 182,
      firstPageVisual: firstPageVisual,
      sources: [
        '[1] AMAZON COM INC, "Form 10-K," Securities and Exchance Comission, Washington, D.C., 2024.',
        '[2] Zane Fracek and Nicholas Rossolillo, "Why I Own Amazon Stock", Motley Fool, 2022. Available at https://www.fool.com/investing/2022/10/18/why-i-own-amazon-stock/',
        '[3] Parkev Tatevosian, "Amazon Stock Could Soar 31%, According to Wall Street", Motley Fool, 2023. Available at https://www.fool.com/investing/2023/04/21/amazon-stock-could-soar-31-according-to-wall-stree/',
        '[4] Al Root, "Rivian Was Responsible for Amazon\'s Loss. The Market Was Ready This Time.", Barrons, 2022. Available at https://www.barrons.com/articles/amazon-earnings-rivian-stock-51659042789',
        '[5] Eric J. Savitz, "Amazon to Close Telehealth Service", Barrons, 2022. Available at https://www.barrons.com/articles/-amazon-care-health-service-51661383084',
        '[6] CFA, "Amazon Stock Is Hitting Records. Is It Too Late to Buy Amazon Stock?", Motley Fool, 2024. Available at https://www.fool.com/investing/2024/04/16/amazon-stock-is-hitting-records-is-it-too-late-to/',
        '[7] Travis Hoium, "The Next Big Investment in the Sports Industry Could Be Right Under Your Nose", Motley Fool, 2024. Available at https://www.fool.com/investing/2024/01/23/amazons-power-play-in-sports-streaming/',
        '[8] Parkev Tatevosian, "Best Stock to Buy: Amazon Stock vs. C3.ai Stock", Motley Fool, 2023. Available at https://www.fool.com/investing/2023/02/09/best-stock-to-buy-amazon-stock-vs-c3ai-stock/',
        '[9] Parkev Tatevosian, "Amazon Stock: Bear vs. Bull", Motley Fool, 2023. Available at https://www.fool.com/investing/2023/01/24/amazon-stock-bear-vs-bull/',
        '[10] undefined, "Needham Sees Netflix Losing Out To Amazon, Disney, Apple and Other Streaming Rivals", Benzinga, 2022. Available at https://www.benzinga.com/news/22/03/26168503/needham-sees-netflix-losing-out-to-amazon-disney-apple-and-other-streaming-rivals',
        '[11] Eric Cuka, "Amazon Plunges 20% on Earnings Miss -- Is Amazon Stock a Buy Now?", Motley Fool, 2022. Available at https://www.fool.com/investing/2022/10/27/amazon-plunges-20-on-earnings-miss-is-amazon-stock/',
        '[12] CFA, "What Makes Amazon\'s Artificial Intelligence Unique?", Motley Fool, 2023. Available at https://www.fool.com/investing/2023/05/05/what-makes-amazons-artificial-intelligence-unique/',
        '[13] Ben Levisohn, "Amazon Earnings Are Coming. Will Retail Ruin the Cloud?", Barrons, 2023. Available at https://www.barrons.com/articles/amazon-earnings-stock-price-d49657f8',
        '[14] Parkev Tatevosian, "Down 49% in 2022, Is Amazon Stock a Buy for 2023?", Motley Fool, 2022. Available at https://www.fool.com/investing/2022/12/23/down-49-in-2022-is-amazon-stock-a-buy-for-2023/',
        '[15] Anusuya Lahiri, "Yet Another Experimental Feature By Amazon After Amazon Glow, Amazon Scout and Amazon Care To Be Pulled Down - Amazon.com  ( NASDAQ:AMZN ) ", Benzinga, 2022. Available at https://www.benzinga.com/news/22/10/29248660/amazon-to-pull-down-another-experimental-feature-after-amazon-glow-amazon-scout-amazon-care',
        '[16] Anusuya Lahiri, "Amazon Prepares To Cut More Fluff, Shut 8 Amazon Go stores In Seattle, San Francisco, NYC - Amazon.com  ( NASDAQ:AMZN ) ", Benzinga, 2023. Available at https://www.benzinga.com/news/23/03/31252375/amazon-prepares-to-cut-more-fluff-shut-8-amazon-go-stores-in-seattle-san-francisco-nyc',
        '[17] Zane Fracek and Nicholas Rossolillo, "Why I Own Amazon Stock", Motley Fool, 2022. Available at https://www.fool.com/investing/2022/10/18/why-i-own-amazon-stock/',
        '[18] Parkev Tatevosian, "Amazon Stock Could Soar 31%, According to Wall Street", Motley Fool, 2023. Available at https://www.fool.com/investing/2023/04/21/amazon-stock-could-soar-31-according-to-wall-stree/',
        '[19] Al Root, "Rivian Was Responsible for Amazon\'s Loss. The Market Was Ready This Time.", Barrons, 2022. Available at https://www.barrons.com/articles/amazon-earnings-rivian-stock-51659042789',
        '[20] Eric J. Savitz, "Amazon to Close Telehealth Service", Barrons, 2022. Available at https://www.barrons.com/articles/-amazon-care-health-service-51661383084',
        '[21] CFA, "Amazon Stock Is Hitting Records. Is It Too Late to Buy Amazon Stock?", Motley Fool, 2024. Available at https://www.fool.com/investing/2024/04/16/amazon-stock-is-hitting-records-is-it-too-late-to/',
        '[22] Travis Hoium, "The Next Big Investment in the Sports Industry Could Be Right Under Your Nose", Motley Fool, 2024. Available at https://www.fool.com/investing/2024/01/23/amazons-power-play-in-sports-streaming/',
        '[23] Parkev Tatevosian, "Best Stock to Buy: Amazon Stock vs. C3.ai Stock", Motley Fool, 2023. Available at https://www.fool.com/investing/2023/02/09/best-stock-to-buy-amazon-stock-vs-c3ai-stock/',
        '[24] Parkev Tatevosian, "Amazon Stock: Bear vs. Bull", Motley Fool, 2023. Available at https://www.fool.com/investing/2023/01/24/amazon-stock-bear-vs-bull/',
        '[25] undefined, "Needham Sees Netflix Losing Out To Amazon, Disney, Apple and Other Streaming Rivals", Benzinga, 2022. Available at https://www.benzinga.com/news/22/03/26168503/needham-sees-netflix-losing-out-to-amazon-disney-apple-and-other-streaming-rivals',
        '[26] Eric Cuka, "Amazon Plunges 20% on Earnings Miss -- Is Amazon Stock a Buy Now?", Motley Fool, 2022. Available at https://www.fool.com/investing/2022/10/27/amazon-plunges-20-on-earnings-miss-is-amazon-stock/',
        '[27] CFA, "What Makes Amazon\'s Artificial Intelligence Unique?", Motley Fool, 2023. Available at https://www.fool.com/investing/2023/05/05/what-makes-amazons-artificial-intelligence-unique/',
        '[28] Ben Levisohn, "Amazon Earnings Are Coming. Will Retail Ruin the Cloud?", Barrons, 2023. Available at https://www.barrons.com/articles/amazon-earnings-stock-price-d49657f8',
        '[29] Parkev Tatevosian, "Down 49% in 2022, Is Amazon Stock a Buy for 2023?", Motley Fool, 2022. Available at https://www.fool.com/investing/2022/12/23/down-49-in-2022-is-amazon-stock-a-buy-for-2023/',
        '[30] Anusuya Lahiri, "Yet Another Experimental Feature By Amazon After Amazon Glow, Amazon Scout and Amazon Care To Be Pulled Down - Amazon.com  ( NASDAQ:AMZN ) ", Benzinga, 2022. Available at https://www.benzinga.com/news/22/10/29248660/amazon-to-pull-down-another-experimental-feature-after-amazon-glow-amazon-scout-amazon-care',
        '[31] Anusuya Lahiri, "Amazon Prepares To Cut More Fluff, Shut 8 Amazon Go stores In Seattle, San Francisco, NYC - Amazon.com  ( NASDAQ:AMZN ) ", Benzinga, 2023. Available at https://www.benzinga.com/news/23/03/31252375/amazon-prepares-to-cut-more-fluff-shut-8-amazon-go-stores-in-seattle-san-francisco-nyc',
        '[32] Zane Fracek and Nicholas Rossolillo, "Why I Own Amazon Stock", Motley Fool, 2022. Available at https://www.fool.com/investing/2022/10/18/why-i-own-amazon-stock/',
        '[33] Parkev Tatevosian, "Amazon Stock Could Soar 31%, According to Wall Street", Motley Fool, 2023. Available at https://www.fool.com/investing/2023/04/21/amazon-stock-could-soar-31-according-to-wall-stree/',
        '[34] Al Root, "Rivian Was Responsible for Amazon\'s Loss. The Market Was Ready This Time.", Barrons, 2022. Available at https://www.barrons.com/articles/amazon-earnings-rivian-stock-51659042789',
        '[35] Eric J. Savitz, "Amazon to Close Telehealth Service", Barrons, 2022. Available at https://www.barrons.com/articles/-amazon-care-health-service-51661383084',
        '[36] CFA, "Amazon Stock Is Hitting Records. Is It Too Late to Buy Amazon Stock?", Motley Fool, 2024. Available at https://www.fool.com/investing/2024/04/16/amazon-stock-is-hitting-records-is-it-too-late-to/',
        '[37] Travis Hoium, "The Next Big Investment in the Sports Industry Could Be Right Under Your Nose", Motley Fool, 2024. Available at https://www.fool.com/investing/2024/01/23/amazons-power-play-in-sports-streaming/',
        '[38] Parkev Tatevosian, "Best Stock to Buy: Amazon Stock vs. C3.ai Stock", Motley Fool, 2023. Available at https://www.fool.com/investing/2023/02/09/best-stock-to-buy-amazon-stock-vs-c3ai-stock/',
        '[39] Parkev Tatevosian, "Amazon Stock: Bear vs. Bull", Motley Fool, 2023. Available at https://www.fool.com/investing/2023/01/24/amazon-stock-bear-vs-bull/',
        '[40] undefined, "Needham Sees Netflix Losing Out To Amazon, Disney, Apple and Other Streaming Rivals", Benzinga, 2022. Available at https://www.benzinga.com/news/22/03/26168503/needham-sees-netflix-losing-out-to-amazon-disney-apple-and-other-streaming-rivals',
        '[41] Eric Cuka, "Amazon Plunges 20% on Earnings Miss -- Is Amazon Stock a Buy Now?", Motley Fool, 2022. Available at https://www.fool.com/investing/2022/10/27/amazon-plunges-20-on-earnings-miss-is-amazon-stock/',
        '[42] CFA, "What Makes Amazon\'s Artificial Intelligence Unique?", Motley Fool, 2023. Available at https://www.fool.com/investing/2023/05/05/what-makes-amazons-artificial-intelligence-unique/',
        '[43] Ben Levisohn, "Amazon Earnings Are Coming. Will Retail Ruin the Cloud?", Barrons, 2023. Available at https://www.barrons.com/articles/amazon-earnings-stock-price-d49657f8',
        '[44] Parkev Tatevosian, "Down 49% in 2022, Is Amazon Stock a Buy for 2023?", Motley Fool, 2022. Available at https://www.fool.com/investing/2022/12/23/down-49-in-2022-is-amazon-stock-a-buy-for-2023/',
        '[45] Anusuya Lahiri, "Yet Another Experimental Feature By Amazon After Amazon Glow, Amazon Scout and Amazon Care To Be Pulled Down - Amazon.com  ( NASDAQ:AMZN ) ", Benzinga, 2022. Available at https://www.benzinga.com/news/22/10/29248660/amazon-to-pull-down-another-experimental-feature-after-amazon-glow-amazon-scout-amazon-care',
        '[46] Anusuya Lahiri, "Amazon Prepares To Cut More Fluff, Shut 8 Amazon Go stores In Seattle, San Francisco, NYC - Amazon.com  ( NASDAQ:AMZN ) ", Benzinga, 2023. Available at https://www.benzinga.com/news/23/03/31252375/amazon-prepares-to-cut-more-fluff-shut-8-amazon-go-stores-in-seattle-san-francisco-nyc',
      ],
    });

    return docxBlob;
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
  throw new Error('geting docx blob failed');
};

const convertRecommendation = (recommendation: Recommendation) => {
  switch (recommendation) {
    case 'Buy':
      return 'BUY';
    case 'Hold':
      return 'HOLD';
    case 'Overweight':
      return 'OW';
    case 'Underweight':
      return 'UW';
    case 'Sell':
      return 'SELL';
    default:
      return recommendation;
  }
};

const convertFinancialStrength = (financialStrength: FinancialStrength) => {
  switch (financialStrength) {
    case 'Low':
      return 'LOW';
    case 'Low-Medium':
      return 'LM';
    case 'Medium':
      return 'MED';
    case 'Medium-High':
      return 'MH';
    case 'High':
      return 'HIGH';
    default:
      return financialStrength;
  }
};

export const getDocxBlob = async ({
  componentId,
  summary,
  businessDescription,
  authorName,
  authorCompanyName,
  authorCompanyLogo,
  colorScheme,
  companyLogo,
  firstPageVisual,
  content,
  companyName,
  companyTicker,
  topBarMetrics,
  sidebarMetrics,
  growthAndValuationAnalysisMetrics,
  financialAndRiskAnalysisMetrics,
  recommendation,
  financialStrength,
  targetPrice,
  sources,
}: {
  componentId: string;
  summary: string[];
  businessDescription: string;
  authorName: string;
  authorCompanyName: string;
  authorCompanyLogo: Blob;
  colorScheme: string[];
  companyLogo: Blob;
  firstPageVisual: Blob;
  content: JSONContent;
  companyName: string;
  companyTicker: string;
  topBarMetrics: TopBarMetric[];
  sidebarMetrics: SidebarMetrics;
  growthAndValuationAnalysisMetrics: AnalysisMetrics;
  financialAndRiskAnalysisMetrics: AnalysisMetrics;
  recommendation: Recommendation;
  financialStrength: FinancialStrength;
  targetPrice: number;
  sources: string[];
}) => {
  if (!TEMPLATES.hasOwnProperty(componentId)) {
    throw new Error("Template with this component id doesn't exist");
  }

  // ({ content, colors, twoColumn, authors, authorCompanyName, authorCompanyLogo, createdAt, companyName, companyTicker, companyLogo, summary, businessDescription, sidebarMetrics, growthAndValuationAnalysisMetrics, financialAndRiskAnalysisMetrics, ratings, recommendation, financialStrength, targetPrice, firstPageVisual, secondPageVisual, lastPageVisual, }: EquityAnalystSidebarProps & TemplateConfig)
  const templateFn = TEMPLATES[componentId];

  try {
    console.log('docxBlob');
    const docxBlob = await templateFn({
      content: content,
      colors: colorScheme,
      twoColumn: true,
      authors: [authorName],
      authorCompanyName: authorCompanyName,
      authorCompanyLogo: authorCompanyLogo,
      createdAt: new Date(),
      companyName: companyName,
      companyTicker: companyTicker,
      companyLogo: companyLogo,
      summary: summary ?? [],
      businessDescription: businessDescription ?? '',
      topBarMetrics: topBarMetrics,
      sidebarMetrics: sidebarMetrics,
      growthAndValuationAnalysisMetrics: growthAndValuationAnalysisMetrics,
      financialAndRiskAnalysisMetrics: financialAndRiskAnalysisMetrics,
      ratings: [
        {
          name: '12-month',
          list: ['SELL', 'UW', 'HOLD', 'OW', 'BUY'],
          current: convertRecommendation(recommendation),
        },
        {
          name: 'Financial Strength',
          list: ['LOW', 'LM', 'MED', 'MH', 'HIGH'],
          current: convertFinancialStrength(financialStrength),
        },
      ],
      recommendation: recommendation,
      financialStrength: financialStrength,
      targetPrice: targetPrice,
      firstPageVisual: firstPageVisual,
      sources: sources,
    });

    return docxBlob;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      throw new Error(error.message);
    }
  }
  throw new Error('geting docx blob failed');
};
