import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  console.log('auth/callback called');
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  // const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_ORIGIN}/reports/`,
      );
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_ORIGIN}/auth/auth-code-error`,
  );
}
