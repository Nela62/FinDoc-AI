'use client';

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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconCircleChevronRight } from '@tabler/icons-react';
import { HelpCircle, Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const roles = [
  'Public Equity',
  'Private Equity',
  'Investor Relations',
  'Compliance',
  'Venture Capital',
  'Investment Banking',
  'Financial Advisor',
  'Sales',
  'Retail Investor',
  'Lawyer',
  'Journalist',
  'Consultant',
  'Academics',
  'Others',
] as const;

const filing_reading_frequency = ['Rarely', 'Often', 'Daily'] as const;

const formSchema = z.object({
  companyName: z.string().min(2, { message: 'Company name is required' }),
  analystName: z.string().min(2, { message: 'Analyst name is required' }),
  role: z.enum(roles),
  filing_reading_frequency: z.enum(filing_reading_frequency),
});

export default function OnboardPage() {
  const [isLoading, setLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: 'Findoc Inc.',
      analystName: '',
      role: undefined,
      filing_reading_frequency: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    console.log(values);
    setLoading(false);
  }

  return (
    <div className="w-full mt-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="px-6 space-y-8">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormLabel>Company Name</FormLabel>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            This name will be displayed on financial
                            deliverables.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="analystName"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormLabel>Analyst Name</FormLabel>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            This name will be displayed on financial
                            deliverables.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is your role?</FormLabel>
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
                      {roles.map((role) => (
                        <SelectItem value={role} key={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="filing_reading_frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is your role?</FormLabel>
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
                      {filing_reading_frequency.map((frequency) => (
                        <SelectItem value={frequency} key={frequency}>
                          {frequency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {isLoading ? (
            <Button className="w-full py-4" type="submit" disabled>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            </Button>
          ) : (
            <Button
              className="w-full py-6 rounded-none bg-azure hover:bg-azure/80"
              size="lg"
              type="submit"
            >
              <IconCircleChevronRight
                className="h-8 w-8 text-white"
                stroke={1}
              />
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
}
