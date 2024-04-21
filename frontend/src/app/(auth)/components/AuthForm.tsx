'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { onDemoSubmit } from './formActions';
import { useBoundStore } from '@/providers/store-provider';
// import { demoReports } from '@/stores/reports-store';

const formSchema = z.object({
  password: z.string().min(2).max(50),
});

export type formType = z.infer<typeof formSchema>;

export const AuthForm = () => {
  // const { addReports } = useBoundStore((state) => state);
  const form = useForm<formType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  });

  const onSubmit = async (values: formType) => {
    await onDemoSubmit(values);
    // if (process.env.NEXT_PUBLIC_IS_DEMO === 'true') {
    //   addReports(demoReports);
    // }
  };

  // TODO: add isPending control

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="••••••••" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit">
          Sign In
        </Button>
      </form>
    </Form>
  );
};
