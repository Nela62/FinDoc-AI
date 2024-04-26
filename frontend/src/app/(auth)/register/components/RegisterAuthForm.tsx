'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import { useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(2).max(50),
});

export type formType = z.infer<typeof formSchema>;

export const RegisterAuthForm = ({
  formAction,
}: {
  formAction: (values: formType) => Promise<{ error: string | null }>;
}) => {
  const form = useForm<formType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (values: formType) => {
    setError(null);
    setMessage(null);
    setIsLoading(true);
    const { error } = await formAction(values);
    setIsLoading(false);
    if (error) {
      setError(error);
    } else {
      setMessage('Check email to continue sign in process');
    }
  };

  // TODO: add isPending control

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm">{message}</p>}
        {isLoading ? (
          <Button className="w-full" type="submit" disabled>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Signing Up
          </Button>
        ) : (
          <Button className="w-full" type="submit">
            Sign Up
          </Button>
        )}
      </form>
    </Form>
  );
};
