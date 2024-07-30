import { createClient } from '@/lib/supabase/server';
import { Logger } from 'next-axiom';
import { serviceClient } from '../supabase/service';

export interface AuthResponse {
  error: string | null;
}

const log = new Logger();

const handleAuthError = (error: any, context: string): AuthResponse => {
  log.error(`Error when ${context}`, error);
  switch (error.status) {
    case 429:
      return {
        error:
          'We are experiencing an unusually high load. Please try again later.',
      };
    case 400:
      return { error: 'Invalid credentials' };
    case 422:
      return { error: 'Account not found. Please sign up instead.' };
    case 403:
      return { error: 'Your code has expired or is invalid.' };
    default:
      return { error: 'Could not authenticate user' };
  }
};

export const signInWithPassword = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  'use server';

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error
      ? handleAuthError(error, 'signing in with password')
      : { error: null };
  } catch (err) {
    err instanceof Error &&
      log.error('Unexpected error when signing in with password', err);
    return { error: 'Could not authenticate user' };
  }
};

export const signInWithOtp = async (email: string): Promise<AuthResponse> => {
  'use server';

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    return error
      ? handleAuthError(error, 'signing in with OTP')
      : { error: null };
  } catch (err) {
    err instanceof Error &&
      log.error('Unexpected error when signing in with OTP', err);
    return { error: 'Could not authenticate user' };
  }
};

export const registerWithOtp = async (email: string): Promise<AuthResponse> => {
  'use server';
  const log = new Logger();

  try {
    const supabase = createClient();
    const serviceSupabase = serviceClient();

    const { data: userData } = await serviceSupabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (userData?.email) {
      return { error: 'This email is already taken. Please login instead.' };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    return error
      ? handleAuthError(error, 'registering with OTP')
      : { error: null };
  } catch (err) {
    err instanceof Error &&
      log.error('Unexpected error when registering with OTP', err);
    return { error: 'Could not authenticate user' };
  }
};

export const verifyOtp = async (
  email: string,
  token: string,
  name?: string,
): Promise<AuthResponse> => {
  'use server';

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (!error) {
      const { data, error: userError } = await supabase.auth.getUser();

      if (userError) {
        log.error('Error when verifying OTP and fetching user', userError);
      }

      if (data?.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .insert({ user_id: data.user.id, plan: 'free', name });

        if (updateError) {
          log.error('Error when verifying OTP and updating user', updateError);
        }
      }

      return { error: null };
    }

    return handleAuthError(error, 'verifying OTP');
  } catch (err) {
    err instanceof Error &&
      log.error('Unexpected error when verifying OTP', err);
    return { error: 'Could not authenticate user' };
  }
};
