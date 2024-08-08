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
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { isAfter, startOfWeek } from 'date-fns';
import { Wand2Icon } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { TemplateConfig } from '../NewReport';
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
import { ChartWrapper } from '@/lib/templates/charts/ChartWrapper';
import {
  useFileUrl,
  useUpload,
} from '@supabase-cache-helpers/storage-react-query';
import { SubscriptionPlan } from '@/types/subscription';
import { useRouter } from 'next/navigation';
import { useLogger } from 'next-axiom';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { analytics } from '@/lib/segment';
import { useReportProgress } from '@/hooks/useReportProgress';
import { ServerError } from '@/types/error';
import {
  InitializeReportDataProps,
  InitializeReportDataResponse,
} from '../../utils/initializeReportData';
import { GenerateReportArgs } from '../../utils/generateReport';
import React from 'react';
import { PolygonData } from '@/types/metrics';
import { DailyStockData } from '@/types/alphaVantageApi';
import { processSections } from './utils/processSections';

export const reportFormSchema = z.object({
  reportType: z.string(),
  companyTicker: z.object({ value: z.string(), label: z.string() }),
  recommendation: z.string().optional(),
  targetPrice: z
    .preprocess((a) => parseFloat(z.string().parse(a)), z.number())
    .optional(),
  financialStrength: z.string().optional(),
});

type ChartData = {
  annual: PolygonData;
  quarterly: PolygonData;
  stock: DailyStockData;
  targetPrice: number;
  colors: string[];
};

export const ReportForm = ({
  setIsTemplateCustomization,
  setSelectedReportId,
  templateConfig,
  setReportType,
  userId,
  plan,
  initializeReportData,
  generateReport,
}: {
  setIsTemplateCustomization: Dispatch<SetStateAction<boolean>>;
  setSelectedReportId: Dispatch<SetStateAction<string | null>>;
  templateConfig: TemplateConfig | null;
  setReportType: Dispatch<SetStateAction<string>>;
  userId: string;
  plan: SubscriptionPlan;
  initializeReportData: (
    props: InitializeReportDataProps,
  ) => Promise<InitializeReportDataResponse>;
  generateReport: (args: GenerateReportArgs) => Promise<Record<string, string>>;
}) => {
  const [isOpen, setOpen] = useState(false);
  const [curReportId, setReportId] = useState<string | null>(null);
  const [images, setImages] = useState<Blob[] | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  const { progress, progressMessage, nextStep, finalStep } =
    useReportProgress();

  const { error, handleError, clearError } = useErrorHandler();

  const [reportsNum, setReportsNum] = useState(0);

  const router = useRouter();

  const { isLoading, generateDocxBlob, generatePdf, targetPrice } =
    useDocxGenerator(userId, curReportId);

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

  const tickers: Option[] = React.useMemo(() => {
    return (
      tickersData
        ?.map((ticker) => ({
          value: ticker.ticker,
          label: ticker.label,
        }))
        .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0)) ??
      []
    );
  }, [tickersData]);

  const onGenerateAndFormSubmit = async (
    values: z.infer<typeof reportFormSchema>,
  ) => {
    try {
      analytics.track('Report Generated', {
        ...values,
      });
      if (!templateConfig) {
        throw new Error('Template config is not ready yet.');
      }

      if (!tickersData) {
        throw new Error('Tickers data is not ready yet.');
      }

      setOpen(true);

      const {
        apiData,
        tickerData,
        reportId,
        templateId,
        recommendation,
        targetPrice,
        newsContext,
        xml,
      } = await initializeReportData({ values, plan, templateConfig });

      console.log('baseActions done');

      const generatedBlocks = await generateReport({
        reportId,
        templateId,
        recommendation,
        targetPrice,
        ticker: tickerData.ticker,
        companyName: tickerData.company_name,
        apiData,
        xmlData: xml,
        newsContext,
        plan,
      });

      const generatedJson = processSections(generatedBlocks);

      await supabase
        .from('reports')
        .update({
          tiptap_content: generatedJson,
          json_content: generatedBlocks,
        })
        .eq('id', reportId);

      console.log('report generated');

      setChartData({
        annual: apiData.polygonAnnual,
        quarterly: apiData.polygonQuarterly,
        stock: apiData.dailyStock,
        targetPrice: Number(targetPrice),
        colors: templateConfig.colorScheme.colors,
      });

      setReportId(reportId);
    } catch (err) {
      if (err instanceof Error || err instanceof ServerError)
        handleError(err, !(err instanceof ServerError));
      throw err;
    }
  };

  useEffect(() => {
    if (!isLoading && images) {
      console.log('generating pdf...');
      generateDocxBlob(images)
        .then((blob: Blob) => generatePdf(blob))
        .then(() => {
          // finalStep();
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
  ]);

  // const onFormSubmit = async (values: z.infer<typeof reportFormSchema>) => {
  //   // baseActions
  //   await baseActions(values);
  //   // save the pdf template in db
  //   // route to the report content editor page
  // };

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
      {chartData && (
        <ChartWrapper
          colors={chartData.colors}
          targetPrice={chartData.targetPrice}
          polygonAnnual={chartData.annual}
          polygonQuarterly={chartData.quarterly}
          dailyStock={chartData.stock}
          setCharts={setImages}
        />
      )}
      <div className="flex flex-col gap-4">
        <div className="h-[41px] border-b w-full px-8 flex gap-2 items-center bg-white">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger
                asChild
                className="grow disabled:pointer-events-auto"
              >
                <Button
                  size="sm"
                  variant="outline"
                  className={cn('w-full', 'cursor-not-allowed')}
                  disabled
                >
                  Sections
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your plan doesn&apos;t support this feature.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger
                asChild
                className="grow disabled:pointer-events-auto"
              >
                <Button
                  size="sm"
                  variant="outline"
                  className={cn('w-full', 'cursor-not-allowed')}
                  disabled
                >
                  Sources
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your plan doesn&apos;t support this feature.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger
                asChild
                className="grow disabled:pointer-events-auto"
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full cursor-not-allowed"
                  onClick={() => setIsTemplateCustomization(true)}
                  disabled
                >
                  Customize Template
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your plan doesn&apos;t support this feature.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="w-full flex flex-col gap-4 h-[calc(100svh-58px)] grow">
          <h2 className={cn('font-semibold text-primary/80 px-8')}>
            Create New Report
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
                          <SelectItem value="Underweight">
                            Underweight
                          </SelectItem>
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
                          <SelectItem value="Medium-High">
                            Medium-High
                          </SelectItem>
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
      </div>
    </>
  );
};
