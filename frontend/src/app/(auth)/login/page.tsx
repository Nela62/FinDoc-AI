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
    redirect('/reports/');
  }

  return (
    <div className="bg-zinc-900 h-full flex justify-center items-center">
      <div className="bg-white w-[350px] rounded-md overflow-hidden">
        <div className="py-5 bg-azure flex justify-center items-center">
          <Image
            src="/default_finpanel_logo.png"
            alt="Finpanel logo"
            className="h-7 w-auto"
            width={0}
            height={0}
            sizes="100vw"
          />
        </div>
        <LoginAuthForm formAction={signIn} />
      </div>
    </div>
  );
}
