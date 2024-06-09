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
import {
  cleanLink,
  fetchCacheAPIData,
  getPublicCompanyImg,
  getRecommendation,
} from '../../utils/fetchAPI';
import {
  getFinancialAndRiskAnalysisMetrics,
  getGrowthAndValuationAnalysisMetrics,
  getNWeeksStock,
  getSidebarMetrics,
} from '@/lib/utils/financialAPI';
import { ApiProp } from '@/app/api/building-block/blocks';
import { TemplateConfig } from '../../Component';

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
  'company_overview',
  'investment_thesis',
  'business_description',
  'recent_developments',
  // 'industry_overview_competitive_positioning',
  'financial_analysis',
  'valuation',
  // 'management_and_risks',
];

export const ReportForm = ({
  setIsTemplateCustomization,
  templateConfig,
  setReportType,
  userId,
}: {
  setIsTemplateCustomization: Dispatch<SetStateAction<boolean>>;
  templateConfig: TemplateConfig | null;
  setReportType: Dispatch<SetStateAction<string>>;
  userId: string;
}) => {
  const form = useForm<z.infer<typeof reportFormSchema>>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reportType: 'Equity Analyst Report',
      recommendation: 'Auto',
      financialStrength: 'Auto',
    },
  });

  const supabase = createClient();

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

    // Generate a company overview if any
    const tickerData = tickersData?.find(
      (company) => company.ticker === values.companyTicker.value,
    );

    if (!tickerData || !tickersData) {
      throw new Error(
        `Company name for ticker ${values.companyTicker.value} was not found.`,
      );
    }
    const companyOverview = await fetch('/api/building-block/', {
      method: 'POST',
      body: JSON.stringify({
        blockId: 'company_overview',
        customPrompt: '',
        companyName: tickerData.company_name,
        apiData: apiData,
      }),
    }).then((res) => res.json());

    const publicCompanyLogo = await getPublicCompanyImg(
      supabase,
      tickerData.cik,
      tickerData.website,
      tickerData.company_name,
      updateTickers,
      tickersData,
    );

    // Store template config in db
    // insertTemplate([
    //   {
    //     user_id: userId,
    //     report_id: reportId,
    //     template_type: 'equity-analyst-sidebar',
    //     business_description: companyOverview,
    //     color_scheme: templateConfig.colorScheme.colors,
    //     author_name: templateConfig.authorName,
    //     author_company_name: templateConfig.authorCompanyName,
    //     author_company_logo: templateConfig.authorCompanyLogo,
    //   },
    // ]);

    // Get necessary documents and add them to the report library
  };

  const onGenerateAndFormSubmit = async (
    values: z.infer<typeof reportFormSchema>,
  ) => {
    // baseActions
    await baseActions(values);

    // set reportdata with all info
    // start report generation
    // generate a summary if required
    // Save the pdf template in db
  };

  const onFormSubmit = async (values: z.infer<typeof reportFormSchema>) => {
    // baseActions
    await baseActions(values);
    // save the pdf template in db
    // route to the report content editor page
  };

  return (
    <div className="w-[360px] flex flex-col py-4 gap-4 h-full">
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
              disabled={form.watch('recommendation') === 'AUTO'}
              render={({ field }) => (
                <FormItem className="relative">
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
  );
};
