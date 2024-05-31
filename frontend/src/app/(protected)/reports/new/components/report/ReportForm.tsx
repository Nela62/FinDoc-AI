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
import { VirtualizedCombobox } from '@/components/ui/virtualized-combobox';
import { zodResolver } from '@hookform/resolvers/zod';
import { SquarePen, Wand2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
  colorSchemeId: z.array(z.string()),
  templateId: z.string(),
});

export const ReportForm = () => {
  const form = useForm<z.infer<typeof reportFormSchema>>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reportType: 'Equity Analyst Report',
      recommendation: 'AUTO',
      financialStrength: 'AUTO',
    },
  });

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
  );
};
