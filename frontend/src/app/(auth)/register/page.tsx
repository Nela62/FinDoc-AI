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
import { RegisterAuthForm, formType } from './components/RegisterAuthForm';

export default function Login() {
  const signUp = async ({ email, password }: formType) => {
    'use server';

    const origin = headers().get('origin');
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    return { error: error ? error.message : null };
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
        <h2 className="text-3xl font-semibold text-foreground">
          Create a new account
        </h2>
      </div>
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterAuthForm formAction={signUp} />
        </CardContent>
        <CardFooter className="text-sm justify-center">
          Already have an account?{' '}
          <Link href="/login" className="underline ml-1">
            Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
