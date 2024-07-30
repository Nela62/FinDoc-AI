import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Logger } from 'next-axiom';

const log = new Logger();

// Google OAuth not working locally
// https://github.com/orgs/supabase/discussions/20353

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  // const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createClient();

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_ORIGIN}/reports/`,
      );
    } else {
      log.error('Error when authenticating with Google', error);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_ORIGIN}/auth/auth-code-error`,
  );
}
