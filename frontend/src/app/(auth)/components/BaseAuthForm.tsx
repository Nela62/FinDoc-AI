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
import { useState } from 'react';
import { ArrowLeft, Loader2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { IconCircleChevronRight } from '@tabler/icons-react';
import { Separator } from '@/components/ui/separator';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { GoogleSignInButton } from './GoogleButton';

export type AuthFormType = {
  email: string;
  password?: string;
  token?: string;
  name?: string;
};

type BaseAuthFormProps = {
  mode: 'login' | 'register';
  onSubmit: (values: AuthFormType) => Promise<void>;
  formSchema: z.ZodObject<any>;
};

export const BaseAuthForm: React.FC<BaseAuthFormProps> = ({
  mode,
  onSubmit,
  formSchema,
}) => {
  const form = useForm<AuthFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      token: '',
      name: '',
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOtp, setOtp] = useState(false);
  const [isPassword, setPassword] = useState(false);

  const router = useRouter();

  const resetState = () => {
    setOtp(false);
    setPassword(false);
  };

  const buttonClick = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_ORIGIN}/auth/callback`,
      },
    });
  };

  const handleSubmit = async (values: AuthFormType) => {
    setIsLoading(true);
    try {
      await onSubmit(values);
    } catch (error) {
      setError('Could not authenticate user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 w-full"
      >
        <div className="w-full justify-center flex text-center">
          <Link
            href="/login"
            className={`w-1/2 border-b pb-2 ${
              mode === 'login' ? 'border-azure' : ''
            }`}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className={`w-1/2 pb-2 border-b ${
              mode === 'register' ? 'border-azure' : ''
            }`}
          >
            Sign Up
          </Link>
        </div>
        {(isOtp || isPassword) && (
          <Button
            className="mx-6"
            variant="outline"
            size="sm"
            onClick={resetState}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
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
                      {[...Array(6)].map((_, index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
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
            {mode === 'register' && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="px-6">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
                  <GoogleSignInButton onClick={buttonClick} />
                </div>
              </>
            )}
          </>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <p className="text-xs text-primary/60 px-6">
          By clicking &quot;Continue with Google / Email&quot; you agree to our
          User{' '}
          <Link href="/tos" className="underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/tos" className="underline">
            Privacy Policy
          </Link>
        </p>
        {isLoading ? (
          <Button className="w-full py-4" type="submit" disabled>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            {mode === 'login' ? 'Signing In' : 'Signing Up'}
          </Button>
        ) : (
          <Button
            className="w-full py-6 rounded-none bg-azure hover:bg-azure/80"
            size="lg"
            type="submit"
          >
            <IconCircleChevronRight className="h-8 w-8 text-white" stroke={1} />
          </Button>
        )}
      </form>
    </Form>
  );
};
