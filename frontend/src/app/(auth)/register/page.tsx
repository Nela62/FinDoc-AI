import * as React from 'react';

import { Montserrat } from 'next/font/google';

import Image from 'next/image';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { RegisterAuthForm, formType } from './components/RegisterAuthForm';
import { cn } from '@/lib/utils';

const font = Montserrat({ subsets: ['latin'] });

const signInWithPassword = async ({ email, password }: formType) => {
  'use server';

  const supabase = createClient();

  if (!password) return { error: 'No password' };

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { error: error ? error.message : null };
};

const signInWithOtp = async ({ email }: { email: string }) => {
  'use server';
  console.log('sending otp');

  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  return { error: error ? error.message : null };
};

const verifyOtp = async ({ email, token }: formType) => {
  'use server';

  if (!token) return { error: 'No token provided' };

  const supabase = createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
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
    <div
      className={cn(
        'bg-zinc-800 h-full flex justify-center items-center',
        font.className,
      )}
    >
      <div className="bg-white w-[310px] rounded-md overflow-hidden">
        <div className="py-5 bg-azure flex justify-center items-center">
          <Image
            src="/stacked_findoc_logo.png"
            alt="Finpanel logo"
            className="h-16 w-auto"
            width={0}
            height={0}
            sizes="100vw"
          />
        </div>
        <div className="flex flex-col justify-center items-center gap-2 mt-4">
          <RegisterAuthForm
            signInWithPassword={signInWithPassword}
            signInWithOtp={signInWithOtp}
            verifyOtp={verifyOtp}
          />
        </div>

        {/* <div className="flex w-full text-xs font-semibold">
          <Link
            href="/login"
            className="w-1/2 text-center py-2.5 text-primary/80 border-b border-azure/60"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="w-1/2 text-center py-2.5 text-primary/60 border-b"
          >
            Sign Up
          </Link>
        </div> */}
      </div>
    </div>
  );
}
