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
import { fetchAllReports, fetchTickers } from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import { getNanoId } from '@/lib/utils/nanoId';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useInsertMutation,
  useQuery,
  useUpdateMutation,
} from '@supabase-cache-helpers/postgrest-react-query';
import { format, isAfter, startOfWeek } from 'date-fns';
import { SquarePen, Wand2Icon } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  downloadPublicCompanyImgs,
  fetchAllNews,
  getRecommendation,
} from '../../utils/fetchAPI';
import {
  fetchDailyStock,
  fetchOverview,
  fetchWeeklyStock,
} from '@/lib/utils/metrics/financialAPI';
import { TemplateConfig } from '../../Component';
import { JSONContent } from '@tiptap/core';
import { capitalizeWords, markdownToJson } from '@/lib/utils/formatText';
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
import { Feed } from '@/types/alphaVantageApi';
import { fetchNewsContent, getSecFiling } from './actions';
import { ChartWrapper } from '@/lib/templates/charts/ChartWrapper';
import {
  useFileUrl,
  useUpload,
} from '@supabase-cache-helpers/storage-react-query';
import { GeneralBlock, Block } from '@/app/api/building-block/utils/blocks';
import { SubscriptionPlan } from '@/types/subscription';
import { getTopBarMetrics } from '@/lib/utils/metrics/topBarMetrics';
import { getNWeeksStock } from '@/lib/utils/metrics/stock';
import { getSidebarMetrics } from '@/lib/utils/metrics/sidebarMetrics';
import { getGrowthAndValuationAnalysisMetrics } from '@/lib/utils/metrics/growthAndValuationAnalysisMetrics';
import { getFinancialAndRiskAnalysisMetrics } from '@/lib/utils/metrics/financialAndRiskAnalysisMetrics';
import {
  Job,
  createJob,
  waitForJobCompletion,
  waitForAllJobs,
} from '@/lib/utils/jobs';
import { useRouter } from 'next/navigation';
import { useLogger } from 'next-axiom';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { getRecAndTargetPrice } from './utils';
import { Montserrat } from 'next/font/google';
import { cn } from '@/lib/utils';

const defaultCompanyLogo = '/default_findoc_logo.png';

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
  management: 'Management Analysis',
  risks: 'Risk Analysis',
};

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
  const [polygonApi, setPolygonApi] = useState({
    annual: null,
    quarterly: null,
    stock: null,
  });

  const [jobs, setJobs] = useState<Record<string, Job>>({});

  const { error, handleError, clearError } = useErrorHandler();

  const [reportsNum, setReportsNum] = useState(0);

  const router = useRouter();

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

  const log = useLogger();

  const supabase = createClient();

  const { data: reportsData } = useQuery(fetchAllReports(supabase));

  const { mutateAsync: insertCache } = useInsertMutation(
    supabase.from('api_cache'),
    ['id'],
    'id',
  );

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

  const { data: tickersData } = useQuery(fetchTickers(supabase));

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
    try {
      if (!templateConfig) {
        throw new Error('Template is not ready yet.');
      }

      log.info('Generating new report', {
        ticker: values.companyTicker.value,
        userId: userId,
      });

      // launch the dialog
      setOpen(true);
      setProgressMessage('Fetching data from APIs...');

      // Create a new report and save it to db
      const nanoId = getNanoId();

      const res = await insertNewReport([
        {
          title: `${values.companyTicker.value} - ${
            values.reportType
          } - ${format(new Date(), 'd MMM yyyy')}`,
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
      const apiData = await fetch(`/api/metrics/${values.companyTicker.value}`)
        .then((res) => res.ok && res.json())
        .catch((err) => console.error(err));

      const overview = await fetchOverview(values.companyTicker.value);

      const dailyStock = await fetchDailyStock(values.companyTicker.value);

      const weeklyStock = await fetchWeeklyStock(values.companyTicker.value);

      const { yfAnnual, yfQuarterly, polygonAnnual, polygonQuarterly } =
        apiData;

      await insertCache([
        {
          user_id: userId,
          overview: overview,
          stock: dailyStock,
          report_id: reportId,
        },
      ]);

      setPolygonApi({
        annual: polygonAnnual,
        quarterly: polygonQuarterly,
        stock: dailyStock,
      });

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

      const xmlPath = await getSecFiling(values.companyTicker.value);

      const xml = await supabase.storage
        .from('sec-filings')
        .download(xmlPath)
        .then((res) => res.data?.text());

      // Fetch web data
      setProgress((state) => state + progressValue);
      setProgressMessage('Fetching web news...');
      const news = await fetchAllNews(values.companyTicker.value);

      const getRecentDevelopmentsContext = async (news: any) => {
        let context: Record<string, string>[] = [];
        const promises = Object.keys(news).map((key: string) => {
          return Promise.all(
            news[key as keyof typeof news].feed
              ?.slice(0, 15)
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
      console.log(news);

      let newsContext = '';

      try {
        newsContext = await getRecentDevelopmentsContext(news);
      } catch (err) {
        log.error('Error when generating news context', {
          error: err instanceof Error ? err.message : '',
        });
      }

      const sources = [];
      sources.push(
        `[1] ${tickerData.company_name}, "Form 10-K," Securities and Exchance Comission, Washington, D.C., 2024.`,
      );

      Object.entries(news).map(([key, value]) => {
        value.feed?.slice(0, 15).forEach((n: Feed) => {
          sources.push(
            `[${sources.length + 1}] ${n.authors[0]}, "${n.title}", ${
              n.source
            }, ${n.time_published.slice(0, 4)}. Available at ${n.url}`,
          );
        });
      });

      const { recommendation, targetPrice } = await getRecAndTargetPrice(
        values.recommendation,
        values.targetPrice,
        overview,
        {
          blockId: 'targetprice_recommendation',
          plan,
          apiData: {
            overview,
            yfAnnual: apiData.yfAnnual,
            yfQuarterly: apiData.yfQuarterly,
            dailyStock: dailyStock,
            weeklyStock: weeklyStock,
          },
          recommendation: values.recommendation,
          companyName: tickerData.company_name,
        },
        setJobs,
      );

      const params: Omit<GeneralBlock, 'blockId'> = {
        plan,
        companyName: tickerData.company_name,
        apiData: {
          overview,
          yfAnnual: apiData.yfAnnual,
          yfQuarterly: apiData.yfQuarterly,
          dailyStock: dailyStock,
          weeklyStock: weeklyStock,
        },
        xmlData: xml ?? '',
        newsData: newsContext,
        customPrompt: '',
      };

      const financialStrength =
        values.financialStrength && values.financialStrength !== 'Auto'
          ? values.financialStrength
          : 'Medium';

      // Update the report with rec and fin strength
      await updateReport({
        id: reportId,
        recommendation: recommendation,
        targetprice: targetPrice,
        financial_strength: financialStrength,
      });

      const topBarMetrics = getTopBarMetrics(
        overview,
        targetPrice,
        getNWeeksStock(dailyStock),
        yfQuarterly,
      );

      // Generate metrics
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

      // Generate a company overview if any
      setProgress((state) => state + progressValue);
      setProgressMessage('Generating company overview...');
      const companyOverviewJobId = await createJob(
        {
          blockId: 'company_overview',
          ...params,
        },
        setJobs,
      );

      const companyOverview = await waitForJobCompletion(companyOverviewJobId);

      await downloadPublicCompanyImgs(
        tickerData.cik,
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
        overview,
        dailyStock,
        weeklyStock,
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
    } catch (err) {
      if (err instanceof Error) handleError(err);
      throw err;
    }
  };

  const onGenerateAndFormSubmit = async (
    values: z.infer<typeof reportFormSchema>,
  ) => {
    try {
      if (!templateConfig) {
        throw new Error('Template config is not available.');
      }
      // baseActions
      const {
        apiData,
        overview,
        dailyStock,
        weeklyStock,
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

      const params: Omit<GeneralBlock, 'blockId'> = {
        plan,
        companyName: tickerData.company_name,
        apiData: {
          overview,
          yfAnnual: apiData.yfAnnual,
          yfQuarterly: apiData.yfQuarterly,
          dailyStock: dailyStock,
          weeklyStock: weeklyStock,
        },
        xmlData: xml ?? '',
        newsData: newsContext,
        customPrompt: '',
      };

      const jobIds = await Promise.all(
        section_ids.map(async (id: string) => {
          const jobId = await createJob(
            {
              blockId: id as Block,
              recommendation: recommendation,
              targetPrice: targetPrice.toString(),
              ...params,
            },
            setJobs,
          );
          return { blockId: id, id: jobId };
        }),
      );

      const generatedBlocks = await waitForAllJobs(jobIds);

      log.info('Generated all sections', { ticker: tickerData.ticker });

      section_ids.forEach((id) => {
        if (!generatedBlocks[id]) return;
        generatedContent += `##${titles[id as keyof typeof titles]}\
      ${generatedBlocks[id]}`;

        const json = markdownToJson(generatedBlocks[id]);
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
      setProgressMessage('Generating summary...');
      const summaryJobId = await createJob(
        {
          blockId: 'executive_summary',
          generatedReport: generatedContent,
          plan: plan,
        },
        setJobs,
      );

      const summaryRes = await waitForJobCompletion(summaryJobId);
      const summary = summaryRes.includes('•')
        ? summaryRes
            .split('• ')
            .map((point: string) => point.trim())
            ?.slice(1)
        : summaryRes
            .split('- ')
            .map((point: string) => point.trim())
            ?.slice(1);

      log.info('Generated the summary of a report', {
        ticker: tickerData.ticker,
        summary: summary,
        summaryRes: summaryRes,
      });

      if (summary === '') {
        log.error('Summary is empty', {
          ticker: tickerData.ticker,
          summary: summary,
          summaryRes: summaryRes,
        });
      }
      // update report and template
      updateReport({
        id: reportId,
        tiptap_content: generatedJson,
        json_content: generatedBlocks,
      });
      updateTemplate({
        id: templateId,
        summary: summary,
      });

      setProgress((state) => state + progressValue);
      setProgressMessage('Creating pdf file...');

      setReportId(reportId);
    } catch (err) {
      if (err instanceof Error) handleError(err);
      throw err;
    }
  };

  useEffect(() => {
    if (!isLoading && images) {
      console.log('generating pdf...');
      generateDocxBlob(images)
        .then((blob: Blob) => generatePdf(blob))
        .then(() => {
          setProgress((state) => state + progressValue);
          setOpen(false);
          setSelectedReportId(curReportId);
        });
    } else {
      console.log('still loading');
      console.log('images ', images?.length);
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
            {error.hasError ? (
              <AlertDialogDescription className="text-base pt-6">
                Sorry, something went wrong. We&apos;ve been notified.
              </AlertDialogDescription>
            ) : (
              <>
                <Progress value={progress} className="w-full" />
                <AlertDialogDescription className="text-base pt-6">
                  {progressMessage}
                </AlertDialogDescription>
              </>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                clearError();
                router.refresh();
              }}
            >
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {templateConfig &&
        targetPrice &&
        polygonApi.annual &&
        polygonApi.quarterly &&
        polygonApi.stock && (
          <ChartWrapper
            colors={templateConfig.colorScheme.colors}
            targetPrice={targetPrice}
            polygonAnnual={polygonApi.annual}
            polygonQuarterly={polygonApi.quarterly}
            dailyStock={polygonApi.stock}
            setCharts={setImages}
          />
        )}
      <div className="w-full flex flex-col gap-4 h-full grow">
        <h2 className={cn('font-semibold text-primary/80 px-8')}>
          Configurations
        </h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onGenerateAndFormSubmit)}
            className="space-y-4 grow justify-between flex pb-6 flex-col px-8"
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
