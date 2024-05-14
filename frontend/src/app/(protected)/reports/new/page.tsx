// export default function NewReport() {
//   const [options, setOptions] = useState<OptionsState>({
//     type: '',
//     companyTicker: '',
//     recommendation: Recommendation.Auto,
//     targetPrice: undefined,
//   });
'use client';

//   const updateOption = (key: string, value: string) => {
//     setOptions((prev) => ({ ...prev, [key]: value }));
//   };

//   const getDateName = () => {
//     const currentDate = new Date();

//     // Extract the month, day, and year from the current date
//     const month = currentDate.toLocaleString('default', { month: 'short' });
//     const day = currentDate.getDate();
//     const year = currentDate.getFullYear();

//     // Format the date as "MMM DD, YYYY"
//     const formattedDate = `${month} ${day}, ${year}`;
//     return formattedDate;
//   };

//   // TODO: IMPORTANT - add all tickers

//   type Option = { label: string; value: string };

//   interface OptionsState {
//     type: string;
//     companyTicker: string;
//     recommendation: Recommendation;
//     targetPrice?: string;
//   }
//   const generateReport = async (ticker: string, editor: Editor) => {
//     const company = tickers.find((t) => t.value === ticker)?.label;

//     if (!company) {
//       return;
//     }

//     editor.commands.insertContent('<h1>' + company + '</h1>');

//     const prompts = getPrompts(company);

//     for (let i = 0; i < prompts.length; i++) {
//       const res = await fetch('/api/generation', {
//         method: 'POST',
//         body: JSON.stringify({
//           company,
//           prompt: prompts[i].prompt,
//         }),
//       });
//       const body = await res.json();
//       editor.commands.insertContent('<h2>' + prompts[i].section + '</h2>');
//       editor.commands.insertContent(
//         '<p>' + body.response.replace(/\n/g, '') + '</p>',
//       );
//     }
//   };

//   function SelectorComponent({
//     topLabel,
//     label,
//     options,
//     value,
//     setValue,
//     search,
//     halfWidth,
//   }: {
//     topLabel: string;
//     label: string;
//     options: Option[];
//     value: string;
//     setValue: (value: string) => void;
//     search: boolean;
//     halfWidth?: boolean;
//   }) {
//     return (
//       <div
//         className={`${halfWidth ? 'w-[156px]' : 'w-80'} flex flex-col gap-1`}
//       >
//         <p className="text-sm text-zinc-600 font-semibold">{topLabel}</p>
//         <Combobox
//           label={label}
//           options={options}
//           value={value}
//           setValue={setValue}
//           search={search}
//         />
//       </div>
//     );
//   }
//   const report = reports.find((r) => r.id === reportId);

//   function getDocType(docType: string) {
//     switch (docType) {
//       case '10-K':
//         return DocumentType.TenK;
//       case '10-Q':
//         return DocumentType.TenQ;
//       case 'Earnings Calls':
//         return DocumentType.EarningsCalls;
//       default:
//         return DocumentType.News;
//     }
//   }

//   const fetchDocuments = useCallback(async () => {
//     const documents = await supabase
//       .from('documents')
//       .select('*')
//       .eq('company_ticker', report?.companyTicker);

//     if (!documents.data) return;

//     addDocuments(
//       documents.data.map((doc) => ({
//         ...doc,
//         doc_type: getDocType(doc.doc_type),
//       })),
//     );
//   }, [report, supabase, addDocuments]);

//   useEffect(() => {
//     if (!report) return;
//     fetchDocuments();
//   }, []);

//   const companies = useMemo(
//     () =>
//       tickers.map((t) => ({
//         label: `${t.value} - ${t.label}`,
//         value: t.value,
//       })),
//     [],
//   );

//   return (
//     <div className="bg-white rounded-t-[10px] border-[0.5px] border-stone-300 w-full py-8">
//       <div className="flex flex-col w-fit mx-auto">
//         <p className="w-fit text-xl text-zinc-600 font-semibold font-sans mb-6">
//           Create New Report
//         </p>
//         <div
//           className="flex flex-col gap-4 rounded-lg px-10 py-6"
//           style={{
//             boxShadow: '0px 0px 4px 0px rgba(0,0,0,0.1) inset',
//             backgroundColor: '#F0F2F5',
//           }}
//         >
//           <SelectorComponent
//             topLabel="Report Type"
//             label="Select a report type"
//             options={[
//               {
//                 label: 'Equity Analyst Report',
//                 value: 'EquityAnalyst',
//               },
//               {
//                 label: 'Earnings Call Note',
//                 value: 'EarningsCallNote',
//               },
//               { label: 'Other', value: 'Other' },
//             ]}
//             value={options.type}
//             setValue={(val) => updateOption('type', val)}
//             search={false}
//           />
//           {options.type && (
//             <SelectorComponent
//               topLabel="Company"
//               label="Select a company"
//               value={options.companyTicker}
//               options={companies}
//               setValue={(val) => updateOption('companyTicker', val)}
//               search={true}
//             />
//           )}
//           {options.type === 'EquityAnalyst' && (
//             <div className="flex gap-2">
//               <SelectorComponent
//                 topLabel="Recommendation"
//                 label=""
//                 options={[
//                   { label: 'Auto', value: Recommendation.Auto },
//                   { label: 'Buy', value: Recommendation.Buy },
//                   {
//                     label: 'Overweight',
//                     value: Recommendation.Overweight,
//                   },
//                   { label: 'Hold', value: Recommendation.Hold },
//                   {
//                     label: 'Underweight',
//                     value: Recommendation.Underweight,
//                   },
//                   { label: 'Sell', value: Recommendation.Sell },
//                 ]}
//                 value={options.recommendation}
//                 setValue={(val) => updateOption('recommendation', val)}
//                 search={false}
//                 halfWidth
//               />
//               <div className={`w-[156px] flex flex-col gap-1 relative`}>
//                 <p className="text-sm text-zinc-600 font-semibold">
//                   Target Price
//                 </p>
//                 <input
//                   disabled={options.recommendation === Recommendation.Auto}
//                   style={{ boxShadow: '0px 1px 2px 0px rgb(0,0,0,0.2)' }}
//                   className={`${
//                     options.recommendation === Recommendation.Auto &&
//                     'bg-zinc-200 cursor-not-allowed'
//                   } inline-flex h-10 items-center justify-between gap-1 rounded-md bg-white border-zinc-300 border-[0.5px] px-4 text-zinc-600 focus:border-zinc-400 pl-5 focus:outline-none appearance-none`}
//                   value={
//                     options.recommendation === Recommendation.Auto
//                       ? ''
//                       : options.targetPrice
//                   }
//                   onInput={(e) =>
//                     updateOption('targetPrice', e.currentTarget.value)
//                   }
//                 />
//                 <p className="absolute left-2 bottom-2.5 text-sm text-zinc-600">
//                   $
//                 </p>
//               </div>
//             </div>
//           )}
//           {/* TODO: add tooltip when disabled */}
//           {options.type && options.companyTicker && (
//             <div className="flex flex-col gap-1">
//               <button className="mt-2 flex gap-1 items-center w-fit">
//                 <p className="text-xs text-zinc-600 font-semibold">
//                   Choose a template
//                 </p>
//                 <ChevronDown className="h-4 w-4 text-zinc-600" />
//               </button>

//               <button className="mt-2 flex gap-1 items-center w-fit">
//                 <p className="text-xs text-zinc-600 font-semibold">
//                   Edit sources
//                 </p>
//                 <ChevronDown className="h-4 w-4 text-zinc-600" />
//               </button>
//             </div>
//           )}
//           <div className="flex gap-4 w-full mt-2 mb-2">
//             <button
//               disabled={!options.companyTicker || !options.type}
//               style={{ boxShadow: '0px 1px 2px 0px rgb(0,0,0,0.2)' }}
//               className={`${
//                 !options.companyTicker || !options.type
//                   ? 'cursor-not-allowed text-zinc-400 bg-zinc-200'
//                   : 'hover:border-zinc-400'
//               } flex gap-2 w-1/2 border-zinc-300  border text-zinc-600 bg-white py-2 items-center justify-center rounded-md px-[15px] font-medium leading-none focus:outline-none text-sm`}
//               onClick={() => {
//                 if (!options.companyTicker || !options.type) return;
//                 // updateReport({
//                 //   id: reportId,
//                 //   title: `${getDateName()} - ${
//                 //     ReportType[
//                 //       (options.type as keyof typeof ReportType) ?? 'Other'
//                 //     ]
//                 //   }`,
//                 //   ...options,
//                 //   type: ReportType[
//                 //     (options.type as keyof typeof ReportType) ?? 'Other'
//                 //   ],
//                 //   content: '',
//                 //   lastUpdated: new Date(),
//                 //   status:
//                 // });
//                 console.log(reports);
//                 // generateReport(options.company, editor);
//               }}
//             >
//               <SquarePen className="h-5 w-5" />
//               Start writing
//             </button>
//             <button
//               disabled={!options.companyTicker || !options.type}
//               style={{ boxShadow: '0px 1px 2px 0px rgb(0,0,0,0.2)' }}
//               className={`${
//                 !options.companyTicker || !options.type
//                   ? 'bg-indigo8 text-zinc-50 cursor-not-allowed'
//                   : 'bg-accent text-white'
//               } flex gap-2 items-center justify-center text-left w-1/2  rounded-md px-[15px] font-medium focus:shadow-[0_0_0_2px] focus:outline-none text-sm py-1`}
//               onClick={() => {
//                 // console.log('generation report');
//                 // generateReport(options.companyTicker, editor);

//                 if (!options.companyTicker || !options.type) return;

//                 function typeContent(
//                   editor: Editor,
//                   content: any[],
//                   delay: number,
//                 ) {
//                   let index = 0;

//                   function type() {
//                     if (index < content.length) {
//                       editor.commands.insertContent(content[index]);
//                       index++;
//                       setTimeout(type, delay);
//                     }
//                   }

//                   type();
//                 }

//                 // updateReport({
//                 //   id: reportId,
//                 //   title: `${getDateName()} - ${
//                 //     ReportType[
//                 //       (options.type as keyof typeof ReportType) ?? 'Other'
//                 //     ]
//                 //   }`,
//                 //   ...options,
//                 //   type: ReportType[
//                 //     (options.type as keyof typeof ReportType) ?? 'Other'
//                 //   ],
//                 //   content: '',
//                 // });

//                 typeContent(editor, newAmazonReport.content, 600);
//               }}
//             >
//               <Wand2Icon className="h-5 w-5" />
//               <div className="flex flex-col w-fit justify-start">
//                 <p>Generate Full</p>
//                 <p>Report</p>
//               </div>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export const metadata: Metadata = {
//   title: 'Create a new report',
// };

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { useEffect, useState } from 'react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
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

const formSchema = z.object({
  reportType: z.string(),
  companyTicker: z.string(),
  recommendation: z.string().optional(),
  targetPrice: z
    .preprocess((a) => parseFloat(z.string().parse(a)), z.number())
    .optional(),
  rating: z.string().optional(),
  // templateId: z.string(),
});

export default function NewReport() {
  const [open, setOpen] = useState(false);
  const client = createClient();

  const [user, setUser] = useState<string | null>(null);

  const router = useRouter();
  useEffect(() => {
    client.auth.getUser().then((res) => {
      if (res.data.user) setUser(res.data.user.id);
    });
  }, [client.auth]);

  const { mutateAsync: insert } = useInsertMutation(
    client.from('reports'),
    ['id'],
    'id, url',
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportType: 'Equity Analyst Report',
      recommendation: 'AUTO',
      rating: 'AUTO',
      // templateId: '1',
    },
  });

  function onFormSubmit(values: z.infer<typeof formSchema>) {
    const today = new Date();
    // const options = { year: 'numeric', month: 'short', day: 'numeric' };
    // const formattedDate = today.toLocaleDateString('en-US', options);
    const nanoId = getNanoId();
    console.log(values);
    if (!user) return;
    insert([
      {
        // user_id: user,
        title: `${moment().format('MMMM DD, YYYY')} - ${values.reportType}`,
        company_ticker: values.companyTicker,
        url: nanoId,
        type: values.reportType,
        recommendation: values.recommendation,
        targetprice: values.targetPrice,
        status: 'Draft',
        user_id: user,
      },
    ]).then((res) => {
      router.push('/reports/' + nanoId);
    });
  }

  return (
    <div className="flex flex-col items-center h-full w-full justify-center bg-muted/40">
      <Card className="mb-10">
        <CardHeader className="font-semibold text-xl text-foreground/80 text-center">
          Create New Report
        </CardHeader>
        <CardContent className="w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)}>
              <div className="flex h-fit gap-20">
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
                            <SelectTrigger>
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
                                  'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 font-normal',
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
                                className="h-9"
                              />
                              <CommandEmpty>No company found.</CommandEmpty>
                              <CommandGroup>
                                <CommandList>
                                  {tickers.map((ticker) => (
                                    <CommandItem
                                      value={ticker.label}
                                      key={ticker.value}
                                      onSelect={() => {
                                        form.setValue(
                                          'companyTicker',
                                          ticker.value,
                                        );
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
                              <SelectItem value="OVERWEIGHT">
                                Overweight
                              </SelectItem>
                              <SelectItem value="HOLD">Hold</SelectItem>
                              <SelectItem value="UNDERWEIGHT">
                                Underweight
                              </SelectItem>
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
                    name="rating"
                    render={({ field }) => (
                      <FormItem className="w-1/2 pr-2">
                        <FormLabel>Analyst Rating</FormLabel>
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
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
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
                <div className="w-fit pr-10 py-1">
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
              </div>
              <div className="flex gap-5 justify-center mt-6">
                <Button type="submit" className="flex gap-2 h-11">
                  <SquarePen className="h-5 w-5" />
                  Start writing
                </Button>
                <Button
                  variant="outline"
                  type="submit"
                  className="flex gap-2 h-11"
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
        </CardContent>
      </Card>
    </div>
  );
}
