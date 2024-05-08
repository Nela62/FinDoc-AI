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
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
// TODO: add a super refinement for companyTicker; it can be optional when reportType doesn't required it

const tickers = [
  { label: 'Amazon Inc.', value: 'AMZN' },
  { label: 'Apple Inc.', value: 'AAPL' },
  { label: 'Microsoft Corp.', value: 'MSFT' },
] as const;

const formSchema = z.object({
  reportType: z.string(),
  companyTicker: z.string(),
  recommendation: z.string().optional(),
  targetPrice: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().optional(),
  ),
  rating: z.string().optional(),
  templateId: z.string(),
});

export default function NewReport() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportType: 'EQUITY',
      recommendation: 'AUTO',
      rating: 'AUTO',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <div className="flex flex-col items-center h-full w-full justify-center">
      <Card className="">
        <CardHeader className="font-semibold">Create New Report</CardHeader>
        <CardContent className="w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex">
                <div className="space-y-4">
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
                            {/* <SelectItem value="EARNINGS">
                              Earnings Calls Notes
                            </SelectItem> */}
                            <SelectItem value="EQUITY">
                              Equity Analyst Report
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
                      <FormItem className="flex flex-col">
                        <FormLabel>Company</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  'w-[200px] justify-between',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                {field.value
                                  ? tickers.find(
                                      (ticker) => ticker.value === field.value,
                                    )?.label
                                  : 'Select ticker'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
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
                                      }}
                                    >
                                      {ticker.label}
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
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
