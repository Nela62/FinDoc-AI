import { createClient } from '@/lib/supabase/server';
import { Logger } from 'next-axiom';
import { serviceClient } from '../supabase/service';
import { AuthenticationError, DatabaseError } from '@/types/error';
import { handleUnexpectedServerError } from '../utils/error';

export interface AuthResponse {
  error: AuthenticationError | DatabaseError | Error | null;
}

const log = new Logger();

// const handleAuthError = (
//   error: AuthApiError,
//   fn: string,
//   inputs: Record<string, any>,
// ): AuthResponse => {
//   log.error(`Error occurred`, { ...error, function: fn, inputs });

//   const errorMessages: Record<number, string> = {
//     429: 'We are experiencing an unusually high load. Please try again later.',
//     400: 'Invalid credentials',
//     422: 'Account not found. Please sign up instead.',
//     403: 'Your code has expired or is invalid.',
//   };

//   return {
//     error: errorMessages[error.status] || 'Could not authenticate user',
//   };
// };

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
      return {
        error: new AuthenticationError(
          error.message,
          'signInWithPassword',
          { email, password },
          [],
          error.status,
          error.code,
        ),
      };
    }

    return { error: null };
  } catch (err) {
    return handleUnexpectedServerError(err, 'signInWithPassword', {
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
      return {
        error: new AuthenticationError(
          error.message,
          'signInWithOtp',
          { email },
          [],
          error.status,
          error.code,
        ),
      };
    }

    return { error: null };
  } catch (err) {
    return handleUnexpectedServerError(err, 'signInWithOtp', { email });
  }
};

export const registerWithOtp = async (email: string): Promise<AuthResponse> => {
  'use server';

  try {
    const supabase = createClient();
    const serviceSupabase = serviceClient();

    const { data: userData } = await serviceSupabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (userData?.email) {
      return {
        error: new AuthenticationError(
          'This email is already taken. Please login instead.',
          'registerWithOtp',
          { email },
          [],
          422,
          'user_already_exists',
        ),
      };
      // return { error: 'This email is already taken. Please login instead.' };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      return {
        error: new AuthenticationError(
          error.message,
          'registerWithOtp',
          { email },
          [],
          error.status,
          error.code,
        ),
      };
    }

    return { error: null };
  } catch (err) {
    return handleUnexpectedServerError(err, 'registerWithOtp', { email });
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
      return {
        error: new AuthenticationError(
          error.message,
          'verifyOtp',
          { email, token, name },
          [],
          error.status,
          error.code,
        ),
      };
    }

    const { data, error: userError } = await supabase.auth.getUser();

    if (userError) {
      return {
        error: new AuthenticationError(
          'Error when verifying OTP and fetching user' + userError,
          'verifyOtp',
          { email, token, name },
          [],
          userError.status,
          userError.code,
        ),
      };
    }

    if (data?.user) {
      const { error: updateError } = await supabase
        .from('profiles')
        .insert({ user_id: data.user.id, plan: 'free', name });

      if (updateError) {
        return {
          error: new DatabaseError(
            updateError.message,
            'verifyOtp',
            { email, token, name },
            [],
            `await supabase.from('profiles').insert({ user_id: ${data.user.id}, plan: 'free', ${name} })`,
          ),
        };
      }
    }

    return { error: null };

    // return handleAuthError(error, 'verifying OTP');
  } catch (err) {
    return handleUnexpectedServerError(err, 'verifyOtp', {
      email,
      token,
      name,
    });
  }
};
