import * as React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginAuthForm, formType } from './components/LoginAuthForm';

export default function Login() {
  const signIn = async ({ email, password }: formType) => {
    'use server';

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error ? error.message : null };
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
  // TODO: add tanstack/react-query for auth and isloading

  return (
    <div className="mx-auto flex flex-col justify-center space-y-7 w-fit">
      <div className="flex flex-col gap-2 w-fit mx-auto items-center">
        <Image
          src="/coreline_logo.png"
          alt="Coreline logo"
          className="h-7 w-7"
          width={0}
          height={0}
          sizes="100vw"
        />
        <h2 className="text-3xl font-semibold text-foreground">Welcome back</h2>
      </div>
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginAuthForm formAction={signIn} />
        </CardContent>
        <CardFooter className="text-sm justify-center">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="underline ml-1">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
