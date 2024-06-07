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
import { fetchTickers } from '@/lib/queries';
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
import { Dispatch, SetStateAction, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { fetchCacheAPIData, getRecommendation } from '../../utils/fetchAPI';
import {
  getFinancialAndRiskAnalysisMetrics,
  getGrowthAndValuationAnalysisMetrics,
  getNWeeksStock,
  getSidebarMetrics,
} from '@/lib/utils/financialAPI';

export const reportFormSchema = z.object({
  reportType: z.string(),
  companyTicker: z.object({ value: z.string(), label: z.string() }),
  recommendation: z.string().optional(),
  targetPrice: z
    .preprocess((a) => parseFloat(z.string().parse(a)), z.number())
    .optional(),
  financialStrength: z.string().optional(),
  analystName: z.string().optional(),
  companyName: z.string().optional(),
  companyLogo: z.string().optional(),
});

export const ReportForm = ({
  setIsTemplateCustomization,
  setReportType,
  userId,
}: {
  setIsTemplateCustomization: Dispatch<SetStateAction<boolean>>;
  setReportType: Dispatch<SetStateAction<string>>;
  userId: string;
}) => {
  const form = useForm<z.infer<typeof reportFormSchema>>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reportType: 'Equity Analyst Report',
      recommendation: 'AUTO',
      financialStrength: 'AUTO',
    },
  });

  const supabase = createClient();

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

  const tickers: Option[] =
    tickersData
      ?.map((ticker) => ({
        value: ticker.ticker,
        label: ticker.label,
      }))
      .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0)) ??
    [];

  const baseActions = async (values: z.infer<typeof reportFormSchema>) => {
    // TODO: launch the dialog
    // Create a new report and save it to db
    const nanoId = getNanoId();
    const res = await insertNewReport([
      {
        title: `${format(new Date(), 'MMM d, yyyy')} - ${values.reportType}`,
        company_ticker: values.companyTicker.value,
        url: nanoId,
        type: values.reportType,
        recommendation: values.recommendation,
        targetprice: values.targetPrice,
        status: 'Draft',
        user_id: userId,
      },
    ]);

    if (!res) {
      throw new Error('An exception occurred when creating a new report.');
    }

    const reportId = res[0].id;

    // Fetch and cache API
    const {
      overview,
      incomeStatement,
      balanceSheet,
      earnings,
      dailyStock,
      cashflow,
    } = await fetchCacheAPIData(
      reportId,
      values.companyTicker.value,
      supabase,
      userId,
      insertCache,
    );

    // If rec and/or fin strength are auto, assign them from api
    const recommendation =
      values.recommendation !== 'Auto'
        ? values.recommendation
        : getRecommendation(overview);

    const targetPrice = values.targetPrice
      ? values.targetPrice
      : overview.AnalystTargetPrice;

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

    // Generate a company overview if any
    // Get the company logo
    // Store template config in db
    // Get necessary documents and add them to the report library
  };

  const onGenerateAndFormSubmit = (
    values: z.infer<typeof reportFormSchema>,
  ) => {
    // baseActions
    // set reportdata with all info
    // start report generation
    // generate a summary if required
    // Save the pdf template in db
  };

  const onFormSubmit = (values: z.infer<typeof reportFormSchema>) => {
    // baseActions
    // route to the report content editor page
    // save the pdf template in db
  };

  return (
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
          {/* <FormField
              control={form.control}
              name="companyTicker"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Combobox
                      options={tickers}
                      emptyMessage="Search equity..."
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
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
              disabled={form.watch('recommendation') === 'AUTO'}
              render={({ field }) => (
                <FormItem className="w-1/2 relative">
                  <FormLabel>Target Price</FormLabel>
                  <div className="absolute l-0 ml-2 b-0 text-foreground/70">
                    <p className="pt-1.5 text-sm">$</p>
                  </div>
                  <FormControl>
                    <Input {...field} className="pl-6 bg-white" type="number" />
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
  );
};
