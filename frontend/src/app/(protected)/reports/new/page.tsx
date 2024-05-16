'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Chart } from '@/components/Toolbar/components/export/components/Chart';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import { useInsertMutation } from '@supabase-cache-helpers/postgrest-react-query';
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
  companyLogo: (typeof window === 'undefined'
    ? z.any()
    : z.instanceof(FileList)
  ).optional(),
  colorSchemeId: z.string(),
  templateId: z.string(),
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

export default function NewReport() {
  const [open, setOpen] = useState(false);
  const [isWhitelabelSettings, setIsWhiteLabelSettings] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [reportText, setReportText] = useState<JSONContent | null>(null);
  const [generatedBlocks, setGeneratedBlocks] = useState({});
  const [sectionsGenerated, setSectionsGenerated] = useState(0);

  const ref = useRef<HTMLDivElement>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const supabase = createClient();

  const [user, setUser] = useState<string | null>(null);

  const router = useRouter();
  useEffect(() => {
    supabase.auth.getUser().then((res) => {
      if (res.data.user) setUser(res.data.user.id);
    });
  }, [supabase.auth]);

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
  useEffect(() => {
    if (sectionsGenerated === buildingBlocks.length) {
      setGenerating(false);

      const curReportText = { type: 'doc', content: [] };
      buildingBlocks.forEach((block) => {
        if (block !== 'business_description') {
          // @ts-ignore
          const json = markdownToJson(value);
          const heading = {
            type: 'heading',
            attrs: {
              id: '220f43a9-c842-4178-b5b4-5ed8a33c6192',
              level: 2,
              'data-toc-id': '220f43a9-c842-4178-b5b4-5ed8a33c6192',
            },
            content: [
              {
                // @ts-ignore
                text: formatText(generatedBlocks[block]),
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

      setReportText(curReportText);

      supabase
        .from('reports')
        .update({ json_content: curReportText })
        .match({ id: reportId });
    }
  }, [sectionsGenerated, generatedBlocks, supabase, reportId]);

  async function onGenerateAndFormSubmit(values: z.infer<typeof formSchema>) {
    const today = new Date();
    // const options = { year: 'numeric', month: 'short', day: 'numeric' };
    // const formattedDate = today.toLocaleDateString('en-US', options);
    const nanoId = getNanoId();
    setReportUrl(nanoId);
    if (!user) return;
    setGenerating(true);
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
    setReportId(reportid);
    setGenerating(true);

    buildingBlocks.forEach(async (block) => {
      // TODO: fix citations and how text is parsed
      const body: any = {
        prompt_type: block,
        report_id: reportid,
        ticker: values.companyTicker,
        // model: 'claude-3-haiku-20240307',
      };
      // if (customPrompt) body['custom_prompt'] = customPrompt;

      const res = await fetch(`${baseUrl}/report/`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'content-type': 'application/json',
          Authorization: session.access_token,
        },
      });
      console.log('generated section: ' + block);

      const json = await res.json();
      const text = json.text;
      // generatedBlocks[block] = text;
      if (block === 'business_description') {
        setGeneratedBlocks((state) => ({
          ...state,
          business_description: text,
        }));
      } else {
        const oldToNewCitationsMap = await getCitationMapAndInsertNew(
          text,
          json.citations,
          reportid,
          user,
          insertCitedDocuments,
          insertCitationSnippets,
          insertPDFCitations,
          insertAPICitations,
        );

        const cleanText = getCleanText(text, oldToNewCitationsMap);

        setGeneratedBlocks((state) => ({
          ...state,
          [block]: cleanText,
        }));
      }

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

      setGeneratedBlocks((state) => ({
        ...state,
        [block]: text,
      }));
      setSectionsGenerated((state) => state + 1);
    });
  }

  const mainForm = (
    <>
      <div className="hidden" id="hidden-container" ref={ref}>
        <Chart />
      </div>
      <div className="w-[360px]">
        <div className="space-y-4">
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
                    <SelectItem value="Earnings Calls Notes">
                      Earnings Calls Notes
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
        </div>
      </div>
      <Button
        variant="ghost"
        className="text-xs mt-2 mb-1 font-normal px-2"
        onClick={() => {
          setIsWhiteLabelSettings(true);
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="submit"
              name="generate"
              className="flex gap-2 h-11 w-1/2"
            >
              <Wand2Icon className="h-5 w-5" />
              <div className="flex flex-col w-fit justify-start">
                <p>Generate Full</p>
                <p>Report</p>
              </div>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Generating report...</AlertDialogTitle>
            </AlertDialogHeader>
            <p>
              Generated {sectionsGenerated} sections out of{' '}
              {buildingBlocks.length}
            </p>
            <Progress
              value={(sectionsGenerated / buildingBlocks.length) * 100}
              className=""
            />
            <AlertDialogFooter>
              {generating ? (
                <AlertDialogCancel onClick={() => setGenerating(false)}>
                  Cancel
                </AlertDialogCancel>
              ) : (
                <>
                  <AlertDialogAction
                    onClick={async () => {
                      const element = ref.current;
                      if (!element) return;
                      const canvas = await html2canvas(element, {
                        logging: false,
                        onclone: (clonedDoc) => {
                          if (!clonedDoc.getElementById('hidden-container'))
                            return;
                          clonedDoc.getElementById(
                            'hidden-container',
                          )!.style.display = 'block';
                        },
                      });

                      const img = canvas.toDataURL('image/jpg');

                      if (!reportText) return;
                      const blob = await generateDocxFile(
                        reportText,
                        img,
                        // @ts-ignore
                        generatedBlocks['business_description'] ?? '',
                      );
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      // TODO: Support other report types name
                      link.download = `${moment().format(
                        'MMMM DD, YYYY',
                      )} - Equity Analyst Report`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Download Report
                  </AlertDialogAction>
                  <AlertDialogAction
                    onClick={() => {
                      router.push('/reports/' + reportUrl);
                      setReportUrl(null);
                    }}
                  >
                    Edit Report
                  </AlertDialogAction>
                </>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );

  const whiteLabelSettings = (
    <div className="space-y-4 w-[360px]">
      <div className="flex gap-2 items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsWhiteLabelSettings(false)}
        >
          {'<'}-
        </Button>
        <h2 className="text-foreground/90">Template Customization</h2>
      </div>
      <FormField
        control={form.control}
        name="analystName"
        render={({ field }) => (
          <FormItem className="w-full relative">
            <FormLabel>Analyst Name</FormLabel>
            <FormControl>
              <Input {...field} className="" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="companyName"
        render={({ field }) => (
          <FormItem className="w-full relative">
            <FormLabel>Company Name</FormLabel>
            <FormControl>
              <Input {...field} className="" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="companyLogo"
        render={({ field }) => (
          <FormItem className="w-full relative">
            <FormLabel>Company Logo</FormLabel>
            <FormControl>
              <Input {...field} className="" type="file" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="colorSchemeId"
        render={({ field }) => (
          <FormItem className="w-1/2 pr-2">
            <FormLabel>Color Scheme</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
    </div>
  );

  return (
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
                        className="h-full w-80"
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onGenerateAndFormSubmit)}>
              {isWhitelabelSettings ? whiteLabelSettings : mainForm}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
