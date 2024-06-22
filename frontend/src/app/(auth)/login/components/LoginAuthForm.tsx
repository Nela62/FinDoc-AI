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
import { useBoundStore } from '@/providers/store-provider';
import { useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { IconCircleChevronRight } from '@tabler/icons-react';
import { Separator } from '@/components/ui/separator';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
// import { demoReports } from '@/stores/reports-store';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(),
  token: z.string().optional(),
});

export type formType = z.infer<typeof formSchema>;

export const LoginAuthForm = ({
  signInWithPassword,
  signInWithOtp,
  verifyOtp,
}: {
  signInWithPassword: (values: formType) => Promise<{ error: string | null }>;
  signInWithOtp: (values: formType) => Promise<{ error: string | null }>;
  verifyOtp: (values: formType) => Promise<{ error: string | null }>;
}) => {
  const form = useForm<formType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      token: '',
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOtp, setOtp] = useState(false);
  const [isPassword, setPassword] = useState(false);

  const router = useRouter();

  const onSubmit = async (values: formType) => {
    console.log('submitted values: ', values);
    if (values.email === 'user@finpanel.com' && !values.password) {
      setPassword(true);
    } else if (values.email === 'user@finpanel.com' && values.password) {
      console.log('signing with password');
      setIsLoading(true);
      const { error } = await signInWithPassword(values);
      // setIsLoading(false);

      if (error) {
        console.log(error);
        setError('Could not authenticate user');
        setIsLoading(false);
      } else {
        router.push('/reports/');
      }
    } else if (values.token) {
      setIsLoading(true);
      const { error } = await verifyOtp(values);
      if (error) {
        console.log(error);
        setError('Could not authenticate user');
        setIsLoading(false);
      } else {
        //  setIsLoading(false)
        router.push('/reports/');
      }
    } else {
      setIsLoading(true);
      const { error } = await signInWithOtp(values);
      if (error) {
        console.log(error);
        setIsLoading(false);
        setError('Could not authenticate user');
      } else {
        setOtp(true);
        setIsLoading(false);
      }
    }

    // setIsLoading(true);
    // const { error } = await signInWithPassword(values);
    // // setIsLoading(false);
  };

  // TODO: add isPending control

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {isOtp ? (
          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem className="px-6">
                <FormLabel>One-Time Password</FormLabel>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormDescription>
                  Please enter the one-time password sent to your email.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="px-6">
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isPassword ? (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="px-6">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <>
                <div className="flex gap-2 w-full items-center">
                  <Separator orientation="horizontal" className="grow shrink" />
                  <p className="text-primary/70 text-sm font-semibold">or</p>
                  <Separator orientation="horizontal" className="grow shrink" />
                </div>
                <div className="px-6 w-full">
                  <Button className="w-full">Continue with Google</Button>
                </div>
              </>
            )}
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {isLoading ? (
          <Button className="w-full py-4" type="submit" disabled>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Signing In
          </Button>
        ) : (
          <Button
            className="w-full py-6 rounded-none bg-azure hover:bg-azure/80"
            size="lg"
            type="submit"
            disabled={!form.watch('email')}
          >
            <IconCircleChevronRight className="h-8 w-8 text-white" stroke={1} />
          </Button>
        )}
      </form>
    </Form>
  );
};
