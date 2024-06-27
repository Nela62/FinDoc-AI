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
import {
  fetchAPICacheByReportId,
  fetchAllReports,
  fetchTickers,
} from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import { getNanoId } from '@/lib/utils/nanoId';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useInsertMutation,
  useQuery,
  useUpdateMutation,
} from '@supabase-cache-helpers/postgrest-react-query';
import { format, isAfter, startOfWeek, subWeeks } from 'date-fns';
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
  getTopBarMetrics,
} from '@/lib/utils/financialAPI';
import {
  ApiProp,
  generateBlock,
  generateSummary,
} from '@/app/api/building-block/blocks';
import { TemplateConfig } from '../../Component';
import { JSONContent } from '@tiptap/core';
import { markdownToJson } from '@/lib/utils/formatText';
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
import {
  DailyStockData,
  Earnings,
  IncomeStatement,
  Feed,
} from '@/types/alphaVantageApi';
import { data } from '@/lib/data/structuredData';
import { fetchNewsContent } from './actions';
import { ChartWrapper } from '@/lib/templates/charts/ChartWrapper';
import {
  useFileUrl,
  useUpload,
} from '@supabase-cache-helpers/storage-react-query';
import { Params } from '@/app/api/building-block/utils/blocks';
import { SubscriptionPlan } from '@/types/subscription';

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
  'investment_thesis',
  'business_description',
  'recent_developments',
  'management',
  'risks',
  'financial_analysis',
  'valuation',
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

type JobStatus = 'processing' | 'completed' | 'failed' | 'queued';

type Job = { blockId: string; status: JobStatus; block: string };

export const ReportForm = ({
  setIsTemplateCustomization,
  setSelectedReportId,
  templateConfig,
  setReportType,
  userId,
  plan,
}: {
  setIsTemplateCustomization: Dispatch<SetStateAction<boolean>>;
  setSelectedReportId: Dispatch<SetStateAction<string | null>>;
  templateConfig: TemplateConfig | null;
  setReportType: Dispatch<SetStateAction<string>>;
  userId: string;
  plan: SubscriptionPlan;
}) => {
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [isOpen, setOpen] = useState(false);
  const [curReportId, setReportId] = useState<string | null>(null);
  const [images, setImages] = useState<Blob[] | null>(null);
  const [apiCacheData, setApiCacheData] = useState<apiCacheData | null>(null);

  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [error, setError] = useState<string | null>(null);

  const [reportsNum, setReportsNum] = useState(0);

  const progressValue = 100 / 7;

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

  const { data: reportsData } = useQuery(fetchAllReports(supabase));

  const createJob = async (params: Params) => {
    try {
      const { jobId } = await fetch(`/api/building-block`, {
        method: 'POST',
        body: JSON.stringify(params),
      }).then((res) => res.json());

      setJobs((prevJobs) => ({
        ...prevJobs,
        [jobId]: { blockId: params.blockId, status: 'processing' },
      }));
      return jobId;
    } catch (error) {
      setError('Failed to create job');
      throw error;
    }
  };

  const waitForJobCompletion = async (jobId: string) => {
    while (true) {
      const { status, block } = await fetch(
        `/api/building-block?jobId=${jobId}`,
      )
        .then((res) => res.json())
        .catch((e) => {
          console.error(e);
          throw error;
        });

      if (status === 'completed') {
        return block;
      } else if (status === 'failed') {
        throw new Error('Job failed');
      }

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before polling again
    }
  };

  const waitForAllJobs = async (jobs: Record<string, string>[]) => {
    let results: Record<string, any> = {};
    await Promise.all(
      jobs.map(async (job) => {
        const res = await waitForJobCompletion(job.id);
        results[job.blockId] = res;
      }),
    );
    return results;
  };

  useEffect(() => {
    const pollJobStatuses = async () => {
      const updatedJobs: Record<string, any> = {};

      for (const jobId in jobs) {
        try {
          const response = await fetch(
            `/api/building-block?jobId=${jobId}`,
          ).then((res) => res.json());
          const { status, block } = response.data;
          updatedJobs[jobId] = { ...jobs[jobId], status, block };
        } catch (error) {
          updatedJobs[jobId] = { ...jobs[jobId], status: 'failed' };
        }
      }

      setJobs(updatedJobs);
    };

    const intervalId = setInterval(pollJobStatuses, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [jobs]);

  useEffect(() => {
    if (reportsData) {
      const currentDate = new Date();
      const lastSunday = startOfWeek(currentDate, { weekStartsOn: 0 });

      const filteredDates = reportsData.filter((report) => {
        const date = new Date(report.created_at);
        return isAfter(date, lastSunday);
      });
      setReportsNum(filteredDates.length);
    }
  }, [reportsData]);

  const { data: apiCache } = useQuery(
    fetchAPICacheByReportId(supabase, curReportId ?? ''),
    { enabled: !!curReportId },
  );

  const { data: pdfUrl } = useFileUrl(
    supabase.storage.from('saved-templates'),
    `${userId}/default/equity-analyst`,
    'private',
    {
      refetchOnWindowFocus: false,
    },
  );

  const { mutateAsync: uploadTemplate } = useUpload(
    supabase.storage.from('saved-templates'),
    {
      buildFileName: () => `${userId}/default/equity-analyst`,
      upsert: true,
    },
  );

  useEffect(() => {
    if (!pdfUrl) {
      console.log('pdf file not found');
      fetch('/api/template')
        .then((res) => res.blob())
        .then((blob: Blob) => {
          const file = new File([blob], 'file');
          uploadTemplate({ files: [file] });
        });
    }
  }, [pdfUrl, uploadTemplate]);

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

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const baseActions = async (values: z.infer<typeof reportFormSchema>) => {
    if (!templateConfig) {
      throw new Error('Template is not ready yet.');
    }
    // launch the dialog
    setOpen(true);
    setProgressMessage('Fetching data from APIs...');
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

    const topBarMetrics = getTopBarMetrics(
      overview,
      targetPrice,
      getNWeeksStock(dailyStock),
    );

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

    setProgress((state) => state + progressValue);
    setProgressMessage('Parsing SEC filings...');
    const xmlPath = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/documents/${values.companyTicker.value}/10-K`,
    )
      .then((res) => res.json())
      .then((json) => json.xml_path);

    const xml = await supabase.storage
      .from('sec-filings')
      .download(xmlPath)
      .then((res) => res.data?.text());

    // Fetch web data
    setProgress((state) => state + progressValue);
    setProgressMessage('Fetching web news...');
    const news = await fetchCacheNews(
      reportId,
      values.companyTicker.value,
      supabase,
      userId,
      insertCache,
    );

    const getRecentDevelopmentsContext = async (news: any) => {
      let context: Record<string, string>[] = [];
      const promises = Object.keys(news).map((key: string) => {
        return Promise.all(
          news[key as keyof typeof news].feed
            .slice(0, 15)
            .map(async (f: Feed) => {
              const content = await fetchNewsContent(f.url);
              const obj = {
                title: f.title,
                summary: f.summary,
                time_published: f.time_published,
                content: content ?? '',
              };
              context.push(obj);
            }),
        );
      });

      await Promise.all(promises);

      return JSON.stringify(context);
    };

    const newsContext = await getRecentDevelopmentsContext(news);

    const sources = [];
    sources.push(
      `[1] ${tickerData.company_name}, "Form 10-K," Securities and Exchance Comission, Washington, D.C., 2024.`,
    );

    Object.entries(news).map(([key, value]) => {
      value.feed.slice(0, 15).forEach((n: Feed) => {
        sources.push(
          `[${sources.length + 1}] ${n.authors[0]}, "${n.title}", ${
            n.source
          }, ${n.time_published.slice(0, 4)}. Available at ${n.url}`,
        );
      });
    });

    const params: Omit<Params, 'blockId'> = {
      plan,
      companyName: tickerData.company_name,
      apiData: apiData,
      xmlData: xml ?? '',
      newsData: newsContext,
      customPrompt: '',
    };

    // Generate a company overview if any
    setProgress((state) => state + progressValue);
    setProgressMessage('Generating a company overview...');
    const companyOverviewJobId = await createJob({
      blockId: 'company_overview',
      ...params,
    });

    // const { block: companyOverview } = await fetch('/api/building-block/', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     blockId: 'company_overview',
    //     ...params,
    //   }),
    // }).then((res) => res.json());

    const companyOverview = await waitForJobCompletion(companyOverviewJobId);

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
          topBarMetrics,
          sidebarMetrics,
          growthAndValuationAnalysisMetrics,
          financialAndRiskAnalysisMetrics,
          sources,
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
      companyOverview: companyOverview,
      recommendation,
      targetPrice,
      news,
      newsContext,
      xml,
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
      news,
      newsContext,
      xml,
    } = await baseActions(values);

    const generatedJson: JSONContent = { type: 'doc', content: [] };
    let generatedContent = '';

    setProgress((state) => state + progressValue);
    setProgressMessage('Writing report...');

    const params: Omit<Params, 'blockId'> = {
      plan,
      companyName: tickerData.company_name,
      apiData: apiData,
      xmlData: xml ?? '',
      newsData: newsContext,
      customPrompt: '',
    };

    const jobIds = await Promise.all(
      section_ids.map(async (id: string) => {
        const jobId = await createJob({
          blockId: id,
          recommendation: recommendation,
          targetPrice: targetPrice.toString(),
          ...params,
        });
        return { blockId: id, id: jobId };
      }),
    );

    const generatedBlocks = await waitForAllJobs(jobIds);

    console.log('generated all sections');

    section_ids.forEach((id) => {
      generatedContent += `##${titles[id as keyof typeof titles]}\
      ${generatedBlocks[id]}`;

      const json = markdownToJson(generatedBlocks[id]);
      // console.log(json);
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

    console.log(generatedContent);

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
    setProgressMessage('Creating pdf file...');

    setReportId(reportId);
  };

  useEffect(() => {
    if (!isLoading && images) {
      generateDocxBlob(images)
        .then((blob: Blob) => generatePdf(blob))
        .then(() => {
          setProgress((state) => state + progressValue);
          setOpen(false);
          setSelectedReportId(curReportId);
        });
    } else {
      console.log('still loading');
    }
  }, [
    isLoading,
    images,
    curReportId,
    generateDocxBlob,
    generatePdf,
    setSelectedReportId,
    progressValue,
  ]);

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
              unoptimized
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
      {apiCache && templateConfig && targetPrice && apiCacheData && (
        <ChartWrapper
          colors={templateConfig.colorScheme.colors}
          targetPrice={targetPrice}
          incomeStatement={apiCacheData.incomeStatement}
          earnings={apiCacheData.earnings}
          dailyStock={apiCacheData.dailyStock}
          setCharts={setImages}
        />
      )}
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
                        {/* <SelectItem value="Earnings Call Note">
                          Earnings Call Note
                        </SelectItem> */}
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
              {plan !== 'free' && plan !== 'starter' && (
                <Button
                  variant="ghost"
                  className="text-xs w-fit mt-2 mb-4 font-normal px-2"
                  onClick={() => {
                    setIsTemplateCustomization(true);
                  }}
                >
                  Customize Template -{'>'}
                </Button>
              )}
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
              disabled={plan === 'free' && reportsNum > 5}
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
