import { createClient } from '@/lib/supabase/server';
import { AuthFormType } from '@/app/(auth)/components/BaseAuthForm';
import { Logger } from 'next-axiom';

interface AuthResponse {
  error: string | null;
}

export const signInWithPassword = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  'use server';
  const supabase = createClient();
  const log = new Logger();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (!error) {
    return { error };
  } else {
    switch (error.status) {
      case 429:
        return {
          error:
            'We are experiencing an unusually high load. Please try again later.',
        };
      case 400:
        return {
          error: 'Invalid credentials',
        };
      default:
        log.error('Error when signing in with password', error);
        return { error: 'Could not authenticate user' };
    }
  }
};

export const signInWithOtp = async ({
  email,
}: AuthFormType): Promise<AuthResponse> => {
  'use server';
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });

  return {
    error,
  };
};

export const registerWithOtp = async ({
  email,
  name,
}: AuthFormType): Promise<AuthResponse> => {
  'use server';
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  return { error: error ? error.message : null };
};

export const verifyOtp = async ({
  email,
  token,
  name,
}: AuthFormType): Promise<AuthResponse> => {
  'use server';
  const supabase = createClient();

  if (!token) {
    return { error: 'Token is required' };
  }

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (!error) {
    const { data, error } = await supabase.auth.getUser();

    if (data && data.user) {
      await supabase
        .from('profiles')
        .insert({ user_id: data.user.id, plan: 'free', name: name });
    }
  }

  return { error: error ? error.message : null };
};
