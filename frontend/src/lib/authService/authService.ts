import { createClient } from '@/lib/supabase/server';
import { Logger } from 'next-axiom';
import { serviceClient } from '../supabase/service';
import { AuthenticationError, DatabaseError } from '@/types/error';
import { AuthError, isAuthError } from '@supabase/supabase-js';

export interface AuthResponse {
  error: string | null;
}

const log = new Logger();

const handleAuthError = (
  error: AuthError,
  fnName: string,
  fnInputs: Record<string, any>,
): AuthResponse => {
  log.error('Error occurred', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    fnName,
    fnInputs,
    status: error.status,
    code: error.code,
  });

  console.error(error);

  const errorMessages: Record<number, string> = {
    429: 'We are experiencing an unusually high load. Please try again later.',
    400: 'Invalid login credentials',
    422: 'Account not found. Please sign up instead.',
    403: 'Your code has expired or is invalid.',
  };

  return {
    error:
      (error.status && errorMessages[error.status]) ||
      'Could not authenticate user',
  };
};

const handleUnexpectedError = (
  error: any,
  fnName: string,
  fnInputs: Record<string, any>,
): AuthResponse => {
  if (error instanceof Error || isAuthError(error)) {
    log.error('Unexpected error occurred', { ...error, fnName, fnInputs });
  } else {
    log.error('Unexpected error occurred', { error, fnName, fnInputs });
  }

  return { error: 'Could not authenticate user' };
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

    if (error) {
      return error
        ? handleAuthError(error, 'signInWithPassword', { email, password })
        : { error: null };
    }

    return { error: null };
  } catch (err) {
    return handleUnexpectedError(err, 'signInWithPassword', {
      email,
      password,
    });
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

    if (error) {
      return handleAuthError(error, 'signInWithOtp', { email });
    }

    return { error: null };
  } catch (err) {
    return handleUnexpectedError(err, 'signInWithOtp', { email });
  }
};

export const registerWithOtp = async (email: string): Promise<AuthResponse> => {
  'use server';

  try {
    const supabase = createClient();
    const serviceSupabase = serviceClient();

    const { data: userData, error: userError } = await serviceSupabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (userData?.email) {
      return { error: 'This email is already taken. Please login instead.' };
    } else if (userError) {
      log.error('Error occurred', {
        ...userError,
        fnName: 'registerWithOtp',
        fnInputs: { email },
        sql: `await serviceSupabase.from('profiles').select('email').eq('email', ${email}).single();`,
      });
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      return handleAuthError(error, 'registerWithOtp', { email });
    }

    return { error: null };
  } catch (err) {
    return handleUnexpectedError(err, 'registerWithOtp', { email });
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

    if (error) {
      return handleAuthError(error, 'verifyOtp', { email, token, name });
    }

    const { data, error: userError } = await supabase.auth.getUser();

    if (userError) {
      return handleAuthError(userError, 'verifyOtp', { email, token, name });
    }

    if (data?.user) {
      const { error: updateError } = await supabase
        .from('profiles')
        .insert({ user_id: data.user.id, plan: 'free', name });

      if (updateError) {
        log.error('Error occurred', {
          ...updateError,
          fnName: 'verifyOtp',
          fnInputs: { email, token, name },
          sql: `await supabase.from('profiles').insert({ user_id: ${data.user.id}, plan: 'free', ${name} })`,
        });
        return { error: 'Could not authenticate user' };
      }
    } else {
      log.error('Error occurred', {
        message: 'Could not find authenticated user after verifying Otp',
        fnName: 'verifyOtp',
        fnInputs: { email, token, name },
      });
      return { error: 'Could not authenticate user' };
    }

    return { error: null };
  } catch (err) {
    return handleUnexpectedError(err, 'verifyOtp', {
      email,
      token,
      name,
    });
  }
};
