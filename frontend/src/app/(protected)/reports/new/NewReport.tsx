'use client';

import { useLogger } from 'next-axiom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SquarePen, Wand2Icon } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import {
  useInsertMutation,
  useQuery,
} from '@supabase-cache-helpers/postgrest-react-query';
import { getNanoId } from '@/lib/utils/nanoId';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCitationMapAndInsertNew,
  getCleanText,
} from '@/lib/utils/citations';
import { markdownToJson } from '@/lib/utils/formatText';
import { JSONContent } from '@tiptap/core';
import { generateDocxFile } from '@/components/Toolbar/components/export/components/docxExportArchive';
import { fetchSettings, fetchTickers } from '@/lib/queries';
import {
  useDirectory,
  useFileUrl,
} from '@supabase-cache-helpers/storage-react-query';

import { ReportGenerationDialog } from './components/report/ReportGenerationDialog';
import { useBoundStore } from '@/providers/store-provider';
import { Session } from '@supabase/supabase-js';
import {
  fetchAVEndpoint,
  fetchDailyStock,
  getNWeeksStock,
  getSidebarMetrics,
} from '@/lib/utils/financialAPI';
import {
  BalanceSheet,
  Cashflow,
  DailyStockData,
  DailyStockDataPoint,
  DailyTimeSeries,
  Earnings,
  IncomeStatement,
  Overview,
} from '@/types/alphaVantageApi';
import { toPng } from 'html-to-image';
import { format } from 'date-fns';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import {
  Option,
  VirtualizedCombobox,
} from '@/components/ui/virtualized-combobox';
import { MarketDataChart } from '@/lib/templates/charts/MarketDataChart';

// const tickers: ComboboxOption[] = [
//   { label: 'Amazon Inc.', value: 'AMZN' },
//   { label: 'Microsoft Corporation', value: 'MSFT' },
//   { label: 'Apple Inc.', value: 'AAPL' },
//   { label: 'Alphabet Inc.', value: 'GOOGL' },
//   { label: 'Facebook Inc.', value: 'META' },
//   { label: 'Berkshire Hathaway Inc.', value: 'BRK-A' },
//   { label: 'Tesla Inc.', value: 'TSLA' },
//   { label: 'JPMorgan Chase & Co.', value: 'JPM' },
//   { label: 'Johnson & Johnson', value: 'JNJ' },
//   { label: 'Visa Inc.', value: 'V' },
//   { label: 'Procter & Gamble Company', value: 'PG' },
//   { label: 'Walmart Inc.', value: 'WMT' },
//   { label: 'Mastercard Incorporated', value: 'MA' },
//   { label: 'UnitedHealth Group Incorporated', value: 'UNH' },
//   { label: 'The Home Depot Inc.', value: 'HD' },
//   { label: 'Intel Corporation', value: 'INTC' },
//   { label: 'The Coca-Cola Company', value: 'KO' },
//   { label: 'Verizon Communications Inc.', value: 'VZ' },
//   { label: 'Pfizer Inc.', value: 'PFE' },
//   { label: 'AT&T Inc.', value: 'T' },
//   { label: 'Merck & Co. Inc.', value: 'MRK' },
//   { label: 'Netflix Inc.', value: 'NFLX' },
//   { label: 'Cisco Systems Inc.', value: 'CSCO' },
//   { label: 'Abbott Laboratories', value: 'ABT' },
//   { label: 'AbbVie Inc.', value: 'ABBV' },
//   { label: 'The Walt Disney Company', value: 'DIS' },
//   { label: 'Salesforce.com Inc.', value: 'CRM' },
// ] as const;

const buildingBlocks = [
  'business_description',
  'investment_thesis',
  'earnings_and_growth_analysis',
  'financial_strength_and_dividend',
  'management_and_risks',
  'valuation',
];

const COLOR_SCHEMES = [
  { key: 'blue', colors: ['#1c4587', '#f4e9d3', '#006f3b'] },
  { key: 'red', colors: ['#7d1f1f', '#f4e9d3', '#006f3b'] },
  { key: 'white', colors: ['#787878', '#cce8fb', '#0061d9'] },
];

const templateFormSchema = z.object({
  authorName: z.string(),
  companyName: z.string(),
  companyLogo: z.string().optional(),
  colorSchemeId: z.string(),
});

function formatText(text: string) {
  // Replace underscores with spaces
  let formattedText = text.replace(/_/g, ' ');

  // Capitalize the first letter of each word
  formattedText = formattedText
    .split(' ')
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');

  return formattedText;
}

type ReportData = {
  id?: string;
  url?: string;
  title?: string;
  companyName?: string;
  reportType?: string;
  reportText?: JSONContent;
  companyTicker?: string;
  recommendation?: string;
  targetPrice?: number;
  financialStrength?: string;
  overview?: Overview;
  balanceSheet?: BalanceSheet;
  cashflow?: Cashflow;
  incomeStatement?: IncomeStatement;
  dailyStock?: DailyStockData;
  earnings?: Earnings;
  summary?: string[];
};

export const NewReportComponent = () => {
  const {
    startGeneration,
    increaseSectionsGenerated,
    completeChartStage,
    resetState,
    progress,
    sectionsGenerated,
  } = useBoundStore((state) => state);

  const log = useLogger();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [chart, setChart] = useState<HTMLDivElement | null>(null);

  const [isTemplateCustomization, setIsTemplateCustomization] = useState(false);

  const [reportData, setReportData] = useState<ReportData>({});
  const [generatedBlocks, setGeneratedBlocks] = useState({});

  // const ref = useRef<HTMLDivElement>(null);
  const onRefChange = useCallback((node: HTMLDivElement) => {
    setChart(node);
  }, []);
  const imgRef = useRef<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const supabase = createClient();

  const [user, setUser] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then((res) => {
      if (res.data.user) setUser(res.data.user.id);
    });
  }, [supabase.auth]);

  const { data: settingsData } = useQuery(fetchSettings(supabase));
  const { data: tickersData } = useQuery(fetchTickers(supabase));

  // TODO: sort by cap instead
  const tickers: Option[] =
    tickersData
      ?.map((ticker) => ({
        value: ticker.symbol,
        label: ticker.label,
      }))
      .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0)) ??
    [];

  // const { data: logos } = useDirectory(
  //   supabase.storage.from('company-logos'),
  //   user ?? '',
  //   {
  //     refetchOnWindowFocus: false,
  //     enabled: user !== 'undefined' && user !== null,
  //   },
  // );
  const logos = undefined;

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

  const { mutateAsync: insert } = useInsertMutation(
    supabase.from('reports'),
    ['id'],
    'id, url',
  );

  const { mutateAsync: insertCitedDocuments } = useInsertMutation(
    supabase.from('cited_documents'),
    ['id'],
    'id',
  );

  const { mutateAsync: insertCitationSnippets } = useInsertMutation(
    supabase.from('citation_snippets'),
    ['id'],
    'id',
  );

  const { mutateAsync: insertPDFCitations } = useInsertMutation(
    supabase.from('pdf_citations'),
    ['id'],
    'id',
  );

  const { mutateAsync: insertAPICitations } = useInsertMutation(
    supabase.from('api_citations'),
    ['id'],
    'id',
  );

  type TemplateSettings = {
    authorName: string | undefined;
    companyName: string | undefined;
    companyLogo?: string | undefined;
    colorSchemeId: string;
  };

  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>({
    authorName: settingsData![0].author_name ?? '',
    companyName: settingsData![0].company_name ?? '',
    // companyLogo: (logos && logos[0].name) ?? '/default_coreline_logo.png',
    companyLogo: '/default_coreline_logo.png',
    colorSchemeId: COLOR_SCHEMES[0].key,
  });

  useEffect(() => {
    setTemplateSettings((state) => ({
      ...state,
      // companyLogo: (logos && logos[0].name) ?? '/default_coreline_logo.png',
      companyLogo: '/default_coreline_logo.png',
    }));
  }, [logos]);

  const { data: headerUrl } = useFileUrl(
    supabase.storage.from('company-logos'),
    `${user}/${templateSettings.companyLogo}`,
    'private',
    {
      ensureExistence: true,
      refetchOnWindowFocus: false,
      enabled: templateSettings.companyLogo !== '/default_coreline_logo.png',
    },
  );

  const templateForm = useForm<z.infer<typeof templateFormSchema>>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: templateSettings,
  });

  function onTemplateFormSubmit(values: z.infer<typeof templateFormSchema>) {
    // console.log(values);
    setTemplateSettings(values);
    setIsTemplateCustomization(false);
  }

  function onFormSubmit(values: z.infer<typeof formSchema>) {
    const today = new Date();
    // const options = { year: 'numeric', month: 'short', day: 'numeric' };
    // const formattedDate = today.toLocaleDateString('en-US', options);
    const nanoId = getNanoId();
    if (!user) return;
    insert([
      {
        title: `${format(new Date(), 'MMM d, yyyy')} - ${values.reportType}`,
        company_ticker: values.companyTicker.value,
        url: nanoId,
        type: values.reportType,
        recommendation: values.recommendation,
        targetprice: values.targetPrice,
        status: 'Draft',
        user_id: user,
      },
    ]).then(() => {
      router.push('/reports/' + nanoId);
    });
  }

  useEffect(() => {
    if (
      reportData.earnings &&
      reportData.dailyStock &&
      reportData.incomeStatement
    ) {
      console.log('checking if chart exists...');
      const element = chart;

      if (!element) {
        console.log('chart not found');
        return;
      }

      toPng(element)
        .then((dataUrl) => {
          console.log('got image link');
          imgRef.current = dataUrl;
          completeChartStage();
        })
        .catch((err) => console.error(err));
    }
  }, [reportData, completeChartStage, chart]);

  const downloadReportFn = async () => {
    if (
      !reportData.reportText ||
      !imgRef.current ||
      !reportData.companyTicker ||
      !reportData.overview ||
      !reportData.balanceSheet ||
      !reportData.incomeStatement ||
      !reportData.dailyStock
      // !reportData.targetPrice,
      //   !reportData.financialStrength
    )
      return;
    // @ts-ignore
    const companyDescription: string =
      // @ts-ignore
      generatedBlocks['business_description'] ?? '';

    if (!settingsData || settingsData.length === 0) return;

    const blob = await generateDocxFile({
      content: reportData.reportText,
      img: imgRef.current,
      companyTicker: reportData.companyTicker,
      companyDescription: companyDescription,
      authorName: templateSettings.authorName ?? 'Coreline AI',
      authorCompanyName: templateSettings.companyName ?? 'Coreline',
      companyName:
        tickers.find((t) => t.value === reportData.companyTicker)?.label ?? '',
      recommendation: reportData.recommendation,
      targetPrice: reportData.targetPrice,
      headerImageLink: headerUrl ?? '/default_coreline_logo.png',
      financialStrength: reportData.financialStrength ?? 'HIGH',
      metrics: getSidebarMetrics(
        reportData.overview,
        reportData.balanceSheet,
        reportData.incomeStatement,
        getNWeeksStock(reportData.dailyStock),
        reportData.targetPrice ?? 187,
        reportData.financialStrength ?? 'HIGH',
      ),
      summary: reportData.summary,
      colors:
        COLOR_SCHEMES.find(
          (scheme) => scheme.key === templateSettings.colorSchemeId,
        )?.colors ?? COLOR_SCHEMES[0].colors,
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // TODO: Support other report types name
    link.download = `${format(new Date(), 'MMM d, yyyy')} - ${
      reportData.companyTicker
    } ${reportData.reportType}`;
    link.click();
    URL.revokeObjectURL(url);
    resetState();
    setIsDialogOpen(false);
  };

  const editReportFn = () => {
    resetState();
    setIsDialogOpen(false);
    router.push('/reports/' + reportData.url);
  };

  const cancelReportFn = () => {
    resetState();
    setIsDialogOpen(false);
  };

  const fetchAPIData = useCallback(
    async (reportId: string, ticker: string) => {
      if (!user) return {};
      // TODO: once we have a premium api key, change it to Promise.all
      const overview = await fetchAVEndpoint(
        supabase,
        insertCache,
        reportId,
        user,
        'OVERVIEW',
        ticker,
      );

      const incomeStatement = await fetchAVEndpoint(
        supabase,
        insertCache,
        reportId,
        user,
        'INCOME_STATEMENT',
        ticker,
      );

      const cashflow = await fetchAVEndpoint(
        supabase,
        insertCache,
        reportId,
        user,
        'CASH_FLOW',
        ticker,
      );

      const balanceSheet = await fetchAVEndpoint(
        supabase,
        insertCache,
        reportId,
        user,
        'BALANCE_SHEET',
        ticker,
      );

      const earnings = await fetchAVEndpoint(
        supabase,
        insertCache,
        reportId,
        user,
        'EARNINGS',
        ticker,
      );

      const dailyStock = await fetchDailyStock(
        supabase,
        insertCache,
        reportId,
        user,
        ticker,
      );

      return {
        overview,
        incomeStatement,
        balanceSheet,
        earnings,
        dailyStock,
        cashflow,
      };
    },
    [insertCache, user, supabase],
  );

  useEffect(() => {
    console.log('attempted to call useEffect');

    if (sectionsGenerated === buildingBlocks.length && !reportData.reportText) {
      console.log('called sections generated');
      const curReportText = { type: 'doc', content: [] };
      let totalText = '';
      buildingBlocks.forEach((block) => {
        totalText += '##' + formatText(block);
        // @ts-ignore
        totalText += generatedBlocks[block];

        if (block !== 'business_description') {
          // @ts-ignore
          const json = markdownToJson(generatedBlocks[block]);
          const heading = {
            type: 'heading',
            attrs: {
              id: '220f43a9-c842-4178-b5b4-5ed8a33c6192',
              level: 2,
              'data-toc-id': '220f43a9-c842-4178-b5b4-5ed8a33c6192',
            },
            content: [
              {
                text: formatText(block),
                type: 'text',
              },
            ],
          };
          // @ts-ignore
          curReportText.content.push(
            // @ts-ignore
            heading,
            ...json.content,
          );
        }
      });

      const body = {
        report: totalText,
        model: 'claude-3-haiku-20240307',
      };

      supabase.auth.getSession().then((data) => {
        if (!data) return;
        const session = data.data.session;
        if (!session) return;

        fetch(`${baseUrl}/summary/report/`, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            'content-type': 'application/json',
            Authorization: session.access_token,
          },
        })
          .then((res) => res.json())
          .then((json) => {
            setReportData((state) => ({
              ...state,
              summary: json.summary
                .split('- ')
                .map((point: string) => point.trim())
                .slice(1),
            }));

            if (!reportData.id || !user) return;
            insertTemplate([
              {
                report_id: reportData.id,
                user_id: user,
                author_name: templateSettings.authorName,
                // @ts-ignore
                business_description: generatedBlocks['business_description'],
                summary: json.summary
                  .split('- ')
                  .map((point: string) => point.trim())
                  .slice(1),
                color_scheme: COLOR_SCHEMES.find(
                  (scheme) => scheme.key === templateSettings.colorSchemeId,
                )?.colors,
                template_type: 'ARGUS',
                company_name:
                  tickersData?.find(
                    (company) => company.symbol === reportData.companyTicker,
                  )?.name ?? '',
              },
            ]);
          });
        setReportData((state) => ({ ...state, reportText: curReportText }));

        if (!reportData.id || !user) return;

        supabase
          .from('reports')
          .update({ json_content: curReportText })
          .eq('id', reportData.id)
          .then((res) => {});
      });
    }
  }, [
    sectionsGenerated,
    generatedBlocks,
    supabase,
    reportData.id,
    completeChartStage,
    fetchAPIData,
    baseUrl,
    reportData.reportText,
    insertTemplate,
    reportData.summary,
    templateSettings.colorSchemeId,
    templateSettings.authorName,
    user,
  ]);

  const processBuildingBlocks = async (
    blocks: string[],
    batchSize: number,
    session: Session,
    reportId: string,
    ticker: string,
    apiObjects: any,
  ) => {
    for (let i = 0; i < blocks.length; i += batchSize) {
      const batch = blocks.slice(i, i + batchSize);

      // Process each block in the batch concurrently
      await Promise.all(
        batch.map(async (block) => {
          const body = {
            prompt_type: block,
            report_id: reportId,
            ticker: ticker,
            company_name: tickers.find((c) => c.value === ticker)?.label,
            model: 'claude-3-haiku-20240307',
            api_objects: apiObjects,
          };

          log.info('Generating a building block', {
            prompt_type: block,
            report_id: reportId,
            ticker: ticker,
            company_name: tickers.find((c) => c.value === ticker)?.label,
            model: 'claude-3-haiku-20240307',
          });
          try {
            const res = await fetch(`${baseUrl}/report/`, {
              method: 'POST',
              body: JSON.stringify(body),
              headers: {
                'content-type': 'application/json',
                Authorization: session.access_token,
              },
            });
            log.info('Generated a building block', { res: res });
            console.log('generated section: ' + block);

            const json = await res.json();
            const text = json.text;
            setGeneratedBlocks((state) => ({
              ...state,
              [block]: text,
            }));
            increaseSectionsGenerated();
          } catch (err) {
            console.log(err);
            log.error('Error during building block generation', { error: err });
          }
        }),
      );
    }
  };

  async function onGenerateAndFormSubmit(values: z.infer<typeof formSchema>) {
    const today = new Date();
    // const options = { year: 'numeric', month: 'short', day: 'numeric' };
    // const formattedDate = today.toLocaleDateString('en-US', options);
    const nanoId = getNanoId();
    setReportData((state) => ({ ...state, url: nanoId }));
    if (!user) return;
    const data = await insert([
      {
        title: `${format(new Date(), 'MMM d, yyyy')} - ${values.reportType}`,
        company_ticker: values.companyTicker.value,
        url: nanoId,
        type: values.reportType,
        recommendation: values.recommendation,
        targetprice: values.targetPrice,
        status: 'Draft',
        user_id: user,
      },
    ]);

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (!session) return;

    if (!data) return;

    const reportid = data[0].id;
    setReportData((state) => ({
      ...state,
      id: reportid,
      title: `${format(new Date(), 'MMM d, yyyy')} - ${values.reportType}`,
      companyTicker: values.companyTicker.value,
      recommendation: values.recommendation,
      targetPrice: values.targetPrice,
      financialStrength: values.financialStrength,
      reportType: values.reportType,
      companyName:
        tickersData?.find(
          (company) => company.symbol === reportData.companyTicker,
        )?.name ?? '',
    }));
    setIsDialogOpen(true);
    startGeneration(buildingBlocks.length);

    fetchAPIData(reportid, values.companyTicker.value).then((res) => {
      console.log('fetched api data');
      setReportData((state) => ({
        ...state,
        overview: res.overview,
        balanceSheet: res.balanceSheet,
        incomeStatement: res.incomeStatement,
        earnings: res.earnings,
        dailyStock: res.dailyStock,
        cashflow: res.cashflow,
      }));

      processBuildingBlocks(
        buildingBlocks,
        2,
        session,
        reportid,
        values.companyTicker.value,
        {
          overview: res.overview,
          balanceSheet: res.balanceSheet,
          incomeStatement: res.incomeStatement,
          earnings: res.earnings,
          dailyStock: res.dailyStock,
          cashflow: res.cashflow,
        },
      );
    });

    // buildingBlocks.forEach(async (block) => {
    //   // TODO: fix citations and how text is parsed
    //   const body: any = {
    //     prompt_type: block,
    //     report_id: reportid,
    //     ticker: values.companyTicker,
    //     model: 'claude-3-haiku-20240307',
    //   };
    //   // if (customPrompt) body['custom_prompt'] = customPrompt;

    //   log.info('Generating a building block', body);
    //   try {
    //     const res = await fetch(`${baseUrl}/report/`, {
    //       method: 'POST',
    //       body: JSON.stringify(body),
    //       headers: {
    //         'content-type': 'application/json',
    //         Authorization: session.access_token,
    //       },
    //     });
    //     log.info('Generated a building block', { res: res });
    //     console.log('generated section: ' + block);

    //     const json = await res.json();
    //     const text = json.text;
    //     setGeneratedBlocks((state) => ({
    //       ...state,
    //       [block]: text,
    //     }));
    //   } catch (err) {
    //     console.log(err);
    //     log.error('Error during building block generation', { error: err });
    //   }

    //   // generatedBlocks[block] = text;
    //   // if (block === 'business_description') {
    //   //   setGeneratedBlocks((state) => ({
    //   //     ...state,
    //   //     business_description: text,
    //   //   }));
    //   // } else {
    //   //   const oldToNewCitationsMap = await getCitationMapAndInsertNew(
    //   //     text,
    //   //     json.citations,
    //   //     reportid,
    //   //     user,
    //   //     insertCitedDocuments,
    //   //     insertCitationSnippets,
    //   //     insertPDFCitations,
    //   //     insertAPICitations,
    //   //   );

    //   //   const cleanText = getCleanText(text, oldToNewCitationsMap);

    //   //   setGeneratedBlocks((state) => ({
    //   //     ...state,
    //   //     [block]: cleanText,
    //   //   }));
    //   // }

    //   // const oldToNewCitationsMap = await getCitationMapAndInsertNew(
    //   //   text,
    //   //   json.citations,
    //   //   reportid,
    //   //   user,
    //   //   insertCitedDocuments,
    //   //   insertCitationSnippets,
    //   //   insertPDFCitations,
    //   //   insertAPICitations,
    //   // );

    //   // const cleanText = getCleanText(text, oldToNewCitationsMap);

    //   increaseSectionsGenerated();
    // });
  }

  const mainForm = (
    <>
      <ReportGenerationDialog
        cancelReportFn={cancelReportFn}
        editReportFn={editReportFn}
        downloadReportFn={downloadReportFn}
        isOpen={isDialogOpen}
      />
    </>
  );

  const templateCustomizationForm = (
    <div className="space-y-4 w-[360px]">
      <div className="flex gap-2 items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsTemplateCustomization(false)}
        >
          {'<'}-
        </Button>
        <h2 className="text-foreground/90">Template Customization</h2>
      </div>
      <Form {...templateForm}>
        <form
          onSubmit={templateForm.handleSubmit(onTemplateFormSubmit)}
          className="space-y-4"
        >
          <FormField
            control={templateForm.control}
            name="authorName"
            render={({ field }) => (
              <FormItem className="w-full relative">
                <FormLabel>Author Name</FormLabel>
                <FormControl>
                  <Input {...field} className="" defaultValue={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={templateForm.control}
            name="companyName"
            render={({ field }) => (
              <FormItem className="w-full relative">
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input {...field} className="" defaultValue={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={templateForm.control}
            name="companyLogo"
            render={({ field }) => (
              <FormItem className="w-full relative">
                <FormLabel>Company Logo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* {logos ? (
                      logos.map((logo) => (
                        <SelectItem value={logo.name} key={logo.id}>
                          {logo.name}
                        </SelectItem>
                      ))
                    ) : ( */}
                    <SelectItem value="/default_coreline_logo.png">
                      default_coreline_logo.png
                    </SelectItem>
                    {/* )} */}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={templateForm.control}
            name="colorSchemeId"
            render={({ field }) => (
              <FormItem className="w-1/2 pr-2">
                <FormLabel>Color Scheme</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {...COLOR_SCHEMES.map((color) => (
                      <SelectItem key={color.key} value={color.key}>
                        <div className="flex gap-1 w-[120px]">
                          {...color.colors.map((c, i) => (
                            <div
                              key={c + i}
                              style={{ backgroundColor: c }}
                              className="h-5 w-1/3 rounded-sm"
                            ></div>
                          ))}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="w-full gap-4 flex">
            <Button
              className="w-1/2"
              variant="outline"
              onClick={() => {
                templateForm.reset();
              }}
            >
              Reset
            </Button>
            <Button className="w-1/2" type="submit">
              Apply
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );

  return (
    <>
      <div className="sr-only" id="hidden-container">
        {reportData.incomeStatement &&
          reportData.earnings &&
          reportData.dailyStock && (
            <MarketDataChart
              colors={
                COLOR_SCHEMES.find(
                  (scheme) => scheme.key === templateSettings.colorSchemeId,
                )?.colors ?? COLOR_SCHEMES[0].colors
              }
              dailyStock={reportData.dailyStock}
              incomeStatement={reportData.incomeStatement}
              earnings={reportData.earnings}
              targetPrice={reportData.targetPrice ?? 168}
              ref={onRefChange}
            />
          )}
      </div>
      <div className="flex flex-col items-center h-full w-full justify-center bg-muted/40">
        <Card className="mb-10 pb-6  pl-2 pt-2">
          <CardHeader className="font-semibold text-xl text-foreground/80 text-center">
            Create New Report
          </CardHeader>
          <CardContent className="w-full flex gap-20 pr-14">
            <div className="w-fit pl-10 py-1">
              <Carousel>
                <CarouselContent className="pb-1">
                  <CarouselItem>
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                        <Image
                          src="/template.png"
                          alt="Template 1"
                          className="h-[416px] w-[300px]"
                          width={0}
                          height={0}
                          sizes="100vw"
                        />
                      </CardContent>
                    </Card>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>

            {isTemplateCustomization ? templateCustomizationForm : mainForm}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
