'use client';

import { useLogger } from 'next-axiom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Chart } from '@/components/Toolbar/components/export/components/Chart';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandItem,
} from '@/components/ui/command';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckIcon, SquarePen, Wand2Icon } from 'lucide-react';
import { CaretSortIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import {
  useInsertMutation,
  useQuery,
} from '@supabase-cache-helpers/postgrest-react-query';
import { getNanoId } from '@/lib/utils/nanoId';
import { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import {
  getCitationMapAndInsertNew,
  getCleanText,
} from '@/lib/utils/citations';
import { markdownToJson } from '@/lib/utils/formatText';
import html2canvas from 'html2canvas';
import { JSONContent } from '@tiptap/core';
import { generateDocxFile } from '@/components/Toolbar/components/export/components/docxExport';
import { fetchSettings } from '@/lib/queries';
import {
  useDirectory,
  useFileUrl,
} from '@supabase-cache-helpers/storage-react-query';

import { INCOME_STATEMENT_IBM } from '@/lib/data/income_statement_ibm';
import { EARNINGS_IBM } from '@/lib/data/earnings_ibm';
import { ReportGenerationDialog } from './ReportGenerationDialog';
import { useBoundStore } from '@/providers/store-provider';
// TODO: add a super refinement for companyTicker; it can be optional when reportType doesn't required it

const tickers = [
  { label: 'Amazon Inc.', value: 'AMZN' },
  { label: 'Microsoft Corporation', value: 'MSFT' },
  { label: 'Apple Inc.', value: 'AAPL' },
  { label: 'Alphabet Inc.', value: 'GOOGL' },
  { label: 'Facebook Inc.', value: 'FB' },
  { label: 'Berkshire Hathaway Inc.', value: 'BRK-A' },
  { label: 'Tesla Inc.', value: 'TSLA' },
  { label: 'JPMorgan Chase & Co.', value: 'JPM' },
  { label: 'Johnson & Johnson', value: 'JNJ' },
  { label: 'Visa Inc.', value: 'V' },
  { label: 'Procter & Gamble Company', value: 'PG' },
  { label: 'Walmart Inc.', value: 'WMT' },
  { label: 'Mastercard Incorporated', value: 'MA' },
  { label: 'UnitedHealth Group Incorporated', value: 'UNH' },
  { label: 'The Home Depot Inc.', value: 'HD' },
  { label: 'Intel Corporation', value: 'INTC' },
  { label: 'The Coca-Cola Company', value: 'KO' },
  { label: 'Verizon Communications Inc.', value: 'VZ' },
  { label: 'Pfizer Inc.', value: 'PFE' },
  { label: 'AT&T Inc.', value: 'T' },
  { label: 'Merck & Co. Inc.', value: 'MRK' },
  { label: 'Netflix Inc.', value: 'NFLX' },
  { label: 'Cisco Systems Inc.', value: 'CSCO' },
  { label: 'Abbott Laboratories', value: 'ABT' },
  { label: 'AbbVie Inc.', value: 'ABBV' },
  { label: 'The Walt Disney Company', value: 'DIS' },
  { label: 'Salesforce.com Inc.', value: 'CRM' },
] as const;

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

const formSchema = z.object({
  reportType: z.string(),
  companyTicker: z.string(),
  recommendation: z.string().optional(),
  targetPrice: z
    .preprocess((a) => parseFloat(z.string().parse(a)), z.number())
    .optional(),
  financialStrength: z.string().optional(),
  analystName: z.string().optional(),
  companyName: z.string().optional(),
  companyLogo: z.string().optional(),
  colorSchemeId: z.string(),
  templateId: z.string(),
});

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
  reportType?: string;
  reportText?: JSONContent;
  companyTicker?: string;
  recommendation?: string;
  targetPrice?: number;
  financialStrength?: string;
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

  const [open, setOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [isTemplateCustomization, setIsTemplateCustomization] = useState(false);

  const [reportData, setReportData] = useState<ReportData>({});
  const [generatedBlocks, setGeneratedBlocks] = useState({});

  const ref = useRef<HTMLDivElement>(null);
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

  // const { data: logos } = useDirectory(
  //   supabase.storage.from('company-logos'),
  //   user ?? '',
  //   {
  //     refetchOnWindowFocus: false,
  //     enabled: user !== 'undefined' && user !== null,
  //   },
  // );
  const logos = undefined;

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportType: 'Equity Analyst Report',
      recommendation: 'AUTO',
      financialStrength: 'AUTO',
      colorSchemeId: COLOR_SCHEMES[0].key,
      templateId: '1',
    },
  });

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
        title: `${moment().format('MMMM DD, YYYY')} - ${values.reportType}`,
        company_ticker: values.companyTicker,
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

  const downloadReportFn = async () => {
    if (!reportData.reportText || !imgRef.current || !reportData.companyTicker)
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
      colors:
        COLOR_SCHEMES.find(
          (scheme) => scheme.key === templateSettings.colorSchemeId,
        )?.colors ?? COLOR_SCHEMES[0].colors,
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // TODO: Support other report types name
    link.download = `${moment().format(
      'MMMM DD, YYYY',
    )} - Equity Analyst Report`;
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

  useEffect(() => {
    if (sectionsGenerated === buildingBlocks.length) {
      const curReportText = { type: 'doc', content: [] };
      buildingBlocks.forEach((block) => {
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

      setReportData((state) => ({ ...state, reportText: curReportText }));

      if (!reportData.id) return;
      supabase
        .from('reports')
        .update({ json_content: curReportText })
        .eq('id', reportData.id);

      const element = ref.current;

      if (!element) return;
      html2canvas(element, {
        logging: false,
        onclone: (clonedDoc) => {
          if (!clonedDoc.getElementById('hidden-container')) return;
          clonedDoc.getElementById('hidden-container')!.style.display = 'block';
        },
      }).then((canvas) => {
        imgRef.current = canvas.toDataURL('image/jpg');
        completeChartStage();
      });
    }
  }, [
    sectionsGenerated,
    generatedBlocks,
    supabase,
    reportData.id,
    completeChartStage,
  ]);

  async function onGenerateAndFormSubmit(values: z.infer<typeof formSchema>) {
    const today = new Date();
    // const options = { year: 'numeric', month: 'short', day: 'numeric' };
    // const formattedDate = today.toLocaleDateString('en-US', options);
    const nanoId = getNanoId();
    setReportData((state) => ({ ...state, url: nanoId }));
    if (!user) return;
    const data = await insert([
      {
        title: `${moment().format('MMMM DD, YYYY')} - ${values.reportType}`,
        company_ticker: values.companyTicker,
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
      title: `${moment().format('MMMM DD, YYYY')} - ${values.reportType}`,
      companyTicker: values.companyTicker,
      recommendation: values.recommendation,
      targetPrice: values.targetPrice,
      financialStrength: values.financialStrength,
    }));
    setIsDialogOpen(true);
    startGeneration(buildingBlocks.length);

    buildingBlocks.forEach(async (block) => {
      // TODO: fix citations and how text is parsed
      const body: any = {
        prompt_type: block,
        report_id: reportid,
        ticker: values.companyTicker,
        model: 'claude-3-haiku-20240307',
      };
      // if (customPrompt) body['custom_prompt'] = customPrompt;

      log.info('Generating a building block', body);
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
      } catch (err) {
        console.log(err);
        log.error('Error during building block generation', { error: err });
      }

      // generatedBlocks[block] = text;
      // if (block === 'business_description') {
      //   setGeneratedBlocks((state) => ({
      //     ...state,
      //     business_description: text,
      //   }));
      // } else {
      //   const oldToNewCitationsMap = await getCitationMapAndInsertNew(
      //     text,
      //     json.citations,
      //     reportid,
      //     user,
      //     insertCitedDocuments,
      //     insertCitationSnippets,
      //     insertPDFCitations,
      //     insertAPICitations,
      //   );

      //   const cleanText = getCleanText(text, oldToNewCitationsMap);

      //   setGeneratedBlocks((state) => ({
      //     ...state,
      //     [block]: cleanText,
      //   }));
      // }

      // const oldToNewCitationsMap = await getCitationMapAndInsertNew(
      //   text,
      //   json.citations,
      //   reportid,
      //   user,
      //   insertCitedDocuments,
      //   insertCitationSnippets,
      //   insertPDFCitations,
      //   insertAPICitations,
      // );

      // const cleanText = getCleanText(text, oldToNewCitationsMap);

      increaseSectionsGenerated();
    });
  }

  const mainForm = (
    <>
      <ReportGenerationDialog
        cancelReportFn={cancelReportFn}
        editReportFn={editReportFn}
        downloadReportFn={downloadReportFn}
        isOpen={isDialogOpen}
      />
      <div className="w-[360px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onGenerateAndFormSubmit)}
            className="space-y-4"
          >
            {/* Report type */}
            <FormField
              control={form.control}
              name="reportType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Type</FormLabel>
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
            {/* Company ticker */}
            <FormField
              control={form.control}
              name="companyTicker"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Company</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className={cn(
                            'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 font-normal ',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value
                            ? tickers.find(
                                (ticker) => ticker.value === field.value,
                              )?.label
                            : 'Select ticker'}

                          <CaretSortIcon className="h-4 w-4 opacity-50" />
                          {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className={cn(
                        'p-1',
                        'w-full min-w-[var(--radix-popover-trigger-width)]',
                      )}
                    >
                      <Command>
                        <CommandInput
                          placeholder="Search company..."
                          className="h-9 w-full"
                        />
                        <CommandEmpty>No company found.</CommandEmpty>
                        <CommandGroup>
                          <CommandList>
                            {tickers.map((ticker) => (
                              <CommandItem
                                value={ticker.label}
                                key={ticker.value}
                                onSelect={() => {
                                  form.setValue('companyTicker', ticker.value);
                                  setOpen(false);
                                }}
                              >
                                {ticker.label} ({ticker.value})
                                <CheckIcon
                                  className={cn(
                                    'ml-auto h-4 w-4',
                                    ticker.value === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0',
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="recommendation"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Recommendation</FormLabel>
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
                        <SelectItem value="AUTO">Auto</SelectItem>
                        <SelectItem value="BUY">Buy</SelectItem>
                        <SelectItem value="OVERWEIGHT">Overweight</SelectItem>
                        <SelectItem value="HOLD">Hold</SelectItem>
                        <SelectItem value="UNDERWEIGHT">Underweight</SelectItem>
                        <SelectItem value="SELL">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetPrice"
                disabled={form.watch('recommendation') === 'AUTO'}
                render={({ field }) => (
                  <FormItem className="w-1/2 relative">
                    <FormLabel>Target Price</FormLabel>
                    <div className="absolute l-0 ml-2 b-0 text-foreground/70">
                      <p className="pt-1.5 text-sm">$</p>
                    </div>
                    <FormControl>
                      <Input {...field} className="pl-6" type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="financialStrength"
              render={({ field }) => (
                <FormItem className="w-1/2 pr-2">
                  <FormLabel>Financial Strength</FormLabel>
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
                      <SelectItem value="AUTO">Auto</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="LM">Low-Medium</SelectItem>
                      <SelectItem value="MED">Medium</SelectItem>
                      <SelectItem value="MH">Medium-High</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
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
              className="text-xs mt-2 mb-4 font-normal px-2"
              onClick={() => {
                setIsTemplateCustomization(true);
              }}
            >
              Customize Template -{'>'}
            </Button>

            <div className="flex gap-5 w-full mt-14">
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
            </div>
          </form>
        </Form>
      </div>
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
      <div
        className="w-[477px] z-50 absolute h-fit hidden"
        id="hidden-container"
        ref={ref}
      >
        <Chart
          colors={
            COLOR_SCHEMES.find(
              (scheme) => scheme.key === templateSettings.colorSchemeId,
            )?.colors ?? COLOR_SCHEMES[0].colors
          }
          incomeStatement={INCOME_STATEMENT_IBM}
          earnings={EARNINGS_IBM}
          targetPrice={reportData.targetPrice ?? 168}
        />
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
