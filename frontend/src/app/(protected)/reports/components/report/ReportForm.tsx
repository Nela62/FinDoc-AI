import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  VirtualizedCombobox,
  Option,
} from '@/components/ui/virtualized-combobox';
import { fetchAPICacheByReportId, fetchTickers } from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import { getNanoId } from '@/lib/utils/nanoId';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useInsertMutation,
  useQuery,
  useUpdateMutation,
} from '@supabase-cache-helpers/postgrest-react-query';
import { format } from 'date-fns';
import { SquarePen, Wand2Icon } from 'lucide-react';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  downloadPublicCompanyImgs,
  fetchCacheAPIData,
  fetchCacheNews,
  getRecommendation,
} from '../../utils/fetchAPI';
import {
  getFinancialAndRiskAnalysisMetrics,
  getGrowthAndValuationAnalysisMetrics,
  getNWeeksStock,
  getSidebarMetrics,
} from '@/lib/utils/financialAPI';
import {
  ApiProp,
  generateBlock,
  generateSummary,
} from '@/app/api/building-block/blocks';
import { TemplateConfig } from '../../Component';
import { JSONContent } from '@tiptap/core';
import { markdownToJson } from '@/lib/utils/formatText';
import { getDocxBlob } from '../../utils/getDocxBlob';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { useDocxGenerator } from '@/hooks/useDocxGenerator';
import { MarketDataChart } from '@/lib/templates/charts/MarketDataChart';
import {
  DailyStockData,
  Earnings,
  IncomeStatement,
} from '@/types/alphaVantageApi';
import { data } from '@/lib/data/structuredData';

const defaultCompanyLogo = '/default_finpanel_logo.png';

type apiCacheData = {
  incomeStatement: IncomeStatement;
  earnings: Earnings;
  dailyStock: DailyStockData;
};
export const reportFormSchema = z.object({
  reportType: z.string(),
  companyTicker: z.object({ value: z.string(), label: z.string() }),
  recommendation: z.string().optional(),
  targetPrice: z
    .preprocess((a) => parseFloat(z.string().parse(a)), z.number())
    .optional(),
  financialStrength: z.string().optional(),
});

const section_ids = [
  // 'investment_thesis',
  // 'business_description',
  // 'recent_developments',
  // 'industry_overview_competitive_positioning',
  // 'financial_analysis',
  // 'valuation',
  'management_and_risks',
];

const titles = {
  investment_thesis: 'Investment Thesis',
  business_description: 'Business Description',
  recent_developments: 'Recent Developments',
  industry_overview_competitive_positioning:
    'Industry Overview and Competitive Positioning',
  financial_analysis: 'Financial Analysis',
  valuation: 'Valuation',
  management_and_risks: 'Management and Risks',
};

export const ReportForm = ({
  setIsTemplateCustomization,
  setSelectedReportId,
  templateConfig,
  setReportType,
  userId,
}: {
  setIsTemplateCustomization: Dispatch<SetStateAction<boolean>>;
  setSelectedReportId: Dispatch<SetStateAction<string | null>>;
  templateConfig: TemplateConfig | null;
  setReportType: Dispatch<SetStateAction<string>>;
  userId: string;
}) => {
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [isOpen, setOpen] = useState(false);
  const [curReportId, setReportId] = useState<string | null>(null);
  const [chart, setChart] = useState<HTMLDivElement | null>(null);
  const [apiCacheData, setApiCacheData] = useState<apiCacheData | null>(null);

  const progressValue = 100 / 6;

  const {
    docxFile,
    pdfFile,
    isLoading,
    generateDocxBlob,
    generatePdf,
    targetPrice,
  } = useDocxGenerator(userId, curReportId);

  const form = useForm<z.infer<typeof reportFormSchema>>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reportType: 'Equity Analyst Report',
      recommendation: 'Auto',
      financialStrength: 'Auto',
    },
  });

  const supabase = createClient();

  const { data: apiCache } = useQuery(
    fetchAPICacheByReportId(supabase, curReportId ?? ''),
    { enabled: !!curReportId },
  );

  useEffect(() => {
    if (!apiCache) return;

    const incomeStatement = apiCache.find((cache) =>
      cache.endpoint.includes('INCOME_STATEMENT'),
    );

    const earnings = apiCache.find((cache) =>
      cache.endpoint.includes('EARNINGS'),
    );

    const dailyStock = apiCache.find((cache) =>
      cache.endpoint.includes('TIME_SERIES_DAILY'),
    );

    if (incomeStatement && earnings && dailyStock) {
      setApiCacheData({
        incomeStatement: incomeStatement.json_data as IncomeStatement,
        earnings: earnings.json_data as Earnings,
        dailyStock: dailyStock.json_data as DailyStockData,
      });
    }
  }, [apiCache]);

  const onRefChange = useCallback((node: HTMLDivElement) => {
    setChart(node);
  }, []);

  const { data: tickersData } = useQuery(fetchTickers(supabase));

  const { mutateAsync: updateTickers } = useUpdateMutation(
    supabase.from('companies'),
    ['id'],
    'id',
  );

  // TODO: sort by cap instead

  const { mutateAsync: insertNewReport } = useInsertMutation(
    supabase.from('reports'),
    ['id'],
    'id, url',
  );

  const { mutateAsync: updateReport } = useUpdateMutation(
    supabase.from('reports'),
    ['id'],
    'id, url',
  );

  const { mutateAsync: insertCache } = useInsertMutation(
    supabase.from('api_cache'),
    ['id'],
    'id',
  );

  const { mutateAsync: insertTemplate } = useInsertMutation(
    supabase.from('report_template'),
    ['id'],
    'id',
  );

  const { mutateAsync: updateTemplate } = useUpdateMutation(
    supabase.from('report_template'),
    ['id'],
    'id',
  );

  const tickers: Option[] =
    tickersData
      ?.map((ticker) => ({
        value: ticker.ticker,
        label: ticker.label,
      }))
      .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0)) ??
    [];

  const baseActions = async (values: z.infer<typeof reportFormSchema>) => {
    if (!templateConfig) {
      throw new Error('Template is not ready yet.');
    }
    // launch the dialog
    setOpen(true);
    setProgressMessage('Fetching APIs...');
    // Create a new report and save it to db
    const nanoId = getNanoId();

    const res = await insertNewReport([
      {
        title: `${values.companyTicker.value} - ${values.reportType} - ${format(
          new Date(),
          'd MMM yyyy',
        )}`,
        company_ticker: values.companyTicker.value,
        url: nanoId,
        type: values.reportType,
        recommendation: values.recommendation,
        targetprice: values.targetPrice,
        status: 'Draft',
        user_id: userId,
        section_ids: section_ids,
      },
    ]);

    if (!res) {
      throw new Error('An exception occurred when creating a new report.');
    }

    const reportId = res[0].id;

    // Fetch and cache API
    // TODO: split fetch and insert and move it to backend api
    const apiData = await fetchCacheAPIData(
      reportId,
      values.companyTicker.value,
      supabase,
      userId,
      insertCache,
    );

    const {
      overview,
      incomeStatement,
      balanceSheet,
      earnings,
      dailyStock,
      cashflow,
    } = apiData;

    // If rec and/or fin strength are auto, assign them from api
    const recommendation =
      values.recommendation !== 'Auto'
        ? values.recommendation
        : getRecommendation(overview);

    const targetPrice = values.targetPrice
      ? values.targetPrice
      : Number(overview.AnalystTargetPrice);

    const financialStrength =
      values.financialStrength && values.financialStrength !== 'Auto'
        ? values.financialStrength
        : 'Medium';

    // Update the report with rec and fin strength
    updateReport({
      id: reportId,
      recommendation: recommendation,
      targetprice: targetPrice,
      financial_strength: financialStrength,
    });

    // Generate metrics
    const sidebarMetrics = getSidebarMetrics(
      overview,
      balanceSheet,
      incomeStatement,
      getNWeeksStock(dailyStock),
      targetPrice,
      financialStrength,
    );
    const growthAndValuationAnalysisMetrics =
      getGrowthAndValuationAnalysisMetrics(
        balanceSheet,
        cashflow,
        incomeStatement,
        earnings,
        dailyStock,
      );
    const financialAndRiskAnalysisMetrics = getFinancialAndRiskAnalysisMetrics(
      balanceSheet,
      cashflow,
      incomeStatement,
    );

    const tickerData = tickersData?.find(
      (company) => company.ticker === values.companyTicker.value,
    );

    if (!tickerData || !tickersData) {
      throw new Error(
        `Company name for ticker ${values.companyTicker.value} was not found.`,
      );
    }

    // Fetch web data
    setProgress((state) => state + progressValue);
    setProgressMessage('Fetching web news...');
    const { last3Months, last6Months, last12Months } = await fetchCacheNews(
      reportId,
      values.companyTicker.value,
      supabase,
      userId,
      insertCache,
    );

    // Generate a company overview if any
    setProgress((state) => state + progressValue);
    setProgressMessage('Generating a company overview...');
    const { block: companyOverview } = await fetch('/api/building-block/', {
      method: 'POST',
      body: JSON.stringify({
        blockId: 'company_overview',
        customPrompt: '',
        companyName: tickerData.company_name,
        apiData: apiData,
      }),
    }).then((res) => res.json());

    await downloadPublicCompanyImgs(
      tickerData.cik,
      updateTickers,
      tickersData.filter((ticker) => ticker.cik === tickerData.cik),
      tickerData.website,
      supabase,
    );

    // Store template config in db
    const data = await insertTemplate([
      {
        user_id: userId,
        report_id: reportId,
        template_type: 'equity-analyst-sidebar',
        business_description: companyOverview,
        color_scheme: templateConfig.colorScheme.colors,
        author_name: templateConfig.authorName,
        author_company_name: templateConfig.authorCompanyName,
        author_company_logo:
          templateConfig.authorCompanyLogo === defaultCompanyLogo
            ? null
            : templateConfig.authorCompanyLogo,
        metrics: {
          sidebarMetrics,
          growthAndValuationAnalysisMetrics,
          financialAndRiskAnalysisMetrics,
        },
      },
    ]);

    if (!data) {
      throw new Error('Could not save new template.');
    }

    // Get necessary documents and add them to the report library
    return {
      apiData,
      tickerData,
      reportId,
      templateId: data[0].id,
      companyOverview,
      recommendation,
      targetPrice,
      last3Months,
      last6Months,
      last12Months,
    };
  };

  const onGenerateAndFormSubmit = async (
    values: z.infer<typeof reportFormSchema>,
  ) => {
    if (!templateConfig) {
      throw new Error('Template config is not available.');
    }
    // baseActions
    const {
      apiData,
      tickerData,
      reportId,
      templateId,
      recommendation,
      targetPrice,
      last3Months,
      last6Months,
      last12Months,
    } = await baseActions(values);

    const generatedJson: JSONContent = { type: 'doc', content: [] };
    let generatedContent = '';

    const generatedBlocks: Record<string, string> = {};

    // TODO: Generate this dynamically
    // const { data: pdfData } = await supabase
    //   .from('documents')
    //   .select('structured_data')
    //   .eq('url', 'sec-edgar-filings/AMZN/10-K/0001018724-24-000008');

    // start report generation
    setProgress((state) => state + progressValue);
    setProgressMessage('Writing the report...');

    Promise.all(
      section_ids.map(async (id: string) => {
        let content = '';
        if (id === 'investment_thesis') {
          content = await fetch('/api/building-block/investment-thesis', {
            method: 'POST',
            body: JSON.stringify({
              blockId: id,
              customPrompt: '',
              companyName: tickerData.company_name,
              apiData: apiData,
              recommendation: recommendation,
              targetPrice: targetPrice,
            }),
          })
            .then((res) => res.json())
            .then((res) => res.block);

          generatedBlocks[id] = content;
        } else if (id === 'recent_developments') {
          content = await fetch('/api/building-block/recent-developments', {
            method: 'POST',
            body: JSON.stringify({
              blockId: id,
              customPrompt: '',
              companyName: tickerData.company_name,
              apiData: apiData,
              news: { last3Months, last6Months, last12Months },
            }),
          })
            .then((res) => res.json())
            .then((res) => res.block);

          generatedBlocks[id] = content;
        } else if (
          id === 'industry_overview_competitive_positioning' ||
          id === 'management_and_risks'
        ) {
          content = await fetch('/api/building-block/10K', {
            method: 'POST',
            body: JSON.stringify({
              blockId: id,
              customPrompt: '',
              companyName: tickerData.company_name,
              pdfData: data,
            }),
          })
            .then((res) => res.json())
            .then((res) => res.block);

          generatedBlocks[id] = content;
        } else {
          content = await fetch('/api/building-block', {
            method: 'POST',
            body: JSON.stringify({
              blockId: id,
              customPrompt: '',
              companyName: tickerData.company_name,
              apiData: apiData,
            }),
          })
            .then((res) => res.json())
            .then((res) => res.block);

          generatedBlocks[id] = content;
        }
      }),
    ).then(async () => {
      console.log('generated all sections');

      section_ids.forEach((id) => {
        generatedContent += `##${titles[id as keyof typeof titles]}\
      ${generatedBlocks[id]}`;

        const json = markdownToJson(generatedBlocks[id]);
        console.log(json);
        generatedJson.content?.push(
          {
            type: 'heading',
            attrs: {
              id: '220f43a9-c842-4178-b5b4-5ed8a33c6192',
              level: 2,
              'data-toc-id': '220f43a9-c842-4178-b5b4-5ed8a33c6192',
            },
            content: [
              {
                text: titles[id as keyof typeof titles],
                type: 'text',
              },
            ],
          },
          ...json.content,
        );
      });

      // generate a summary if required
      setProgress((state) => state + progressValue);
      setProgressMessage('Generating a summary...');
      const summary = await fetch('/api/building-block/summary', {
        method: 'POST',
        body: JSON.stringify({ reportContent: generatedContent }),
      })
        .then((res) => res.json())
        .then((res) =>
          res.summary
            .split('- ')
            .map((point: string) => point.trim())
            .slice(1),
        );
      console.log(summary);

      // update report and template
      updateReport({ id: reportId, json_content: generatedJson });
      updateTemplate({
        id: templateId,
        summary: summary,
      });

      setProgress((state) => state + progressValue);
      setProgressMessage('Creating a pdf file...');

      setReportId(reportId);
    });
  };

  // useEffect(() => {
  //   if (!isLoading && chart) {
  //     generateDocxBlob(chart)
  //       .then((blob: Blob) => generatePdf(blob))
  //       .then(() => {
  //         setProgress((state) => state + progressValue);
  //         setOpen(false);
  //         setSelectedReportId(curReportId);
  //       });
  //   } else {
  //     console.log('still loading');
  //   }
  // }, [
  //   isLoading,
  //   chart,
  //   // curReportId,
  //   // generateDocxBlob,
  //   // generatePdf,
  //   // setSelectedReportId,
  // ]);

  const onFormSubmit = async (values: z.infer<typeof reportFormSchema>) => {
    // baseActions
    await baseActions(values);
    // save the pdf template in db
    // route to the report content editor page
  };

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generating report</AlertDialogTitle>
            <Image
              src="/tech2d.gif"
              alt="Animated gif"
              className="h-auto w-auto"
              width={0}
              height={0}
              sizes="100vw"
            />
            <Progress value={progress} className="w-full" />
            <AlertDialogDescription className="text-base pt-6">
              {progressMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="sr-only" id="hidden-container">
        {apiCache && templateConfig && targetPrice && apiCacheData && (
          <MarketDataChart
            colors={templateConfig.colorScheme.colors}
            targetPrice={targetPrice}
            incomeStatement={apiCacheData.incomeStatement}
            earnings={apiCacheData.earnings}
            dailyStock={apiCacheData.dailyStock}
            ref={onRefChange}
          />
        )}
      </div>
      <div className="w-[360px] mx-auto flex flex-col py-4 gap-4 h-full">
        <h2 className="font-semibold text-primary/80">Configurations</h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onGenerateAndFormSubmit)}
            className="space-y-4 grow justify-between flex flex-col"
          >
            <div className="flex flex-col space-y-4">
              <FormField
                control={form.control}
                name="reportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Type</FormLabel>
                    <Select
                      onValueChange={(value: string) => {
                        field.onChange(value);
                        setReportType(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Equity Analyst Report">
                          Equity Analyst Report
                        </SelectItem>
                        <SelectItem value="Earnings Call Note">
                          Earnings Call Note
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyTicker"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <VirtualizedCombobox
                        options={tickers}
                        onValueChange={field.onChange}
                        searchPlaceholder="Select ticker..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recommendation"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Recommendation</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Auto">Auto</SelectItem>
                        <SelectItem value="Buy">Buy</SelectItem>
                        <SelectItem value="Overweight">Overweight</SelectItem>
                        <SelectItem value="Hold">Hold</SelectItem>
                        <SelectItem value="Underweight">Underweight</SelectItem>
                        <SelectItem value="Sell">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetPrice"
                disabled={form.watch('recommendation') === 'Auto'}
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Target Price</FormLabel>
                    <div className="absolute l-0 ml-2 b-0 text-foreground/70">
                      <p className="pt-1.5 text-sm">$</p>
                    </div>
                    <FormControl>
                      <Input
                        className="pl-6 bg-white"
                        type="number"
                        {...field}
                        min={0}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="financialStrength"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Financial Strength</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Auto">Auto</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Low-Medium">Low-Medium</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Medium-High">Medium-High</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <div className="flex flex-col space-y-3">
                    <Label>Data Sources</Label>
                    <Button variant="outline" className="w-1/2">
                      Edit Sources
                    </Button>
                  </div> */}
              <Button
                variant="ghost"
                className="text-xs w-fit mt-2 mb-4 font-normal px-2"
                onClick={() => {
                  setIsTemplateCustomization(true);
                }}
              >
                Customize Template -{'>'}
              </Button>
            </div>

            {/* <div className="flex gap-5 w-full mt-14">
            <Button
              variant="outline"
              type="submit"
              name="start-writing"
              className="flex gap-2 w-1/2 h-11"
              onClick={form.handleSubmit(onFormSubmit)}
            >
              <SquarePen className="h-5 w-5" />
              Start writing
            </Button>
            <Button
              type="submit"
              onClick={form.handleSubmit(onGenerateAndFormSubmit)}
              name="generate"
              className="flex gap-2 h-11 w-1/2"
            >
              <Wand2Icon className="h-5 w-5" />
              <div className="flex flex-col w-fit justify-start">
                <p>Generate Full</p>
                <p>Report</p>
              </div>
            </Button>
          </div> */}
            <Button
              type="submit"
              onClick={form.handleSubmit(onGenerateAndFormSubmit)}
              name="generate"
              className="flex gap-2 h-11 mx-auto bg-azure hover:bg-azure/95 px-6"
            >
              <Wand2Icon className="h-5 w-5" />
              <div className="flex flex-col w-fit justify-start">
                <p>Generate Report</p>
              </div>
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
};
