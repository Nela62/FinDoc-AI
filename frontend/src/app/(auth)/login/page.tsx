import * as React from 'react';

import Image from 'next/image';
import Link from 'next/link';
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
import { Cover } from './components/Cover';

const signIn = async ({ email, password }: formType) => {
  'use server';

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { error: error ? error.message : null };
};

export default async function Login() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/reports/all');
  }

  return (
    <div className="container bg-background relative hidden h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Cover />
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
          <h2 className="text-3xl font-semibold text-foreground">
            Welcome back
          </h2>
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
    </div>
  );
}
