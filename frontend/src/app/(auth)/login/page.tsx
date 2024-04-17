import * as React from 'react';

import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/utils/supabase/server';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '../components/SubmitButton';
import { BrandSubmitButton } from '../components/BrandSubmitButton';
import { AuthForm } from '../components/AuthForm';

// TODO: change the real login screen completely - remove password and only have OTP
export default function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const isDemo = process.env.DEMO === 'true';

  const signIn = async (values: { password: string }) => {
    'use server';

    // const email = formData.get('email') as string;
    const password = values.password;
    const supabase = createClient();

    // const { data, error } = await supabase.auth.signInWithPassword({
    //   email,
    //   password,
    // });

    // if (error) {
    //   // return redirect('/login?message=Could not authenticate user');
    //   return redirect('/login?message=Incorrect password or email');
    // }
    // // TODO: fetch reports and redirect to the first one
    // // TODO: figure out what to redirect to for the real acc
    // return redirect('/protected');
  };

  const signUp = async (formData: FormData) => {
    'use server';

    const origin = headers().get('origin');
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return redirect('/login?message=Could not authenticate user');
    }

    return redirect('/login?message=Check email to continue sign in process');
  };

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 ">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isDemo ? 'Demo Account Login' : 'Login'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isDemo
            ? 'Enter the demo password to login'
            : 'Enter your email below to login to your account'}
        </p>
      </div>
      {/* <AuthForm onSubmit={isDemo ? demoSignIn : signIn} /> */}
      <AuthForm />
      <div className="grid gap-2">
        {/* <form className="animate-in">
          <div className="grid gap-4">
            <div className="grid gap-2">
              {!isDemo && (
                <>
                  <Label className="" htmlFor="email">
                    Email
                  </Label>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    required
                    // disabled={isLoading}
                  />
                </>
              )}

              <Label className="mt-2" htmlFor="password">
                Password
              </Label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                autoCapitalize="none"
                autoCorrect="off"
                required
                // disabled={isLoading}
              />
            </div>
            <SubmitButton
              formAction={isDemo ? demoSignIn : signIn}
              label={isDemo ? 'Sign In' : 'Sign In with Email'}
            />
            {searchParams?.message && (
              <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
                {searchParams.message}
              </p>
            )}
          </div>
        </form> */}
        {/* TODO: there must be a better way to manage demo login vs normal login */}
        {/* TODO: the form looks ugly with all these buttons */}
        {!isDemo && (
          <>
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <BrandSubmitButton formAction={signIn} brand="Google" />
            <BrandSubmitButton formAction={signIn} brand="Microsoft" />
          </>
        )}
      </div>
      {!isDemo && (
        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{' '}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      )}
    </div>
  );
}
