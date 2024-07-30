import { createClient } from '@/lib/supabase/server';
import { analytics } from '@/lib/segment';

interface AuthResponse {
  error: string | null;
}

interface FormType {
  email: string;
  password?: string;
  token?: string;
}

export const signInWithPassword = async ({
  email,
  password,
}: FormType): Promise<AuthResponse> => {
  'use server';
  const supabase = createClient();

  if (!password) {
    return { error: 'Password is required' };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  await identifyUser(supabase);

  return { error: null };
};

export const signInWithOtp = async ({
  email,
}: FormType): Promise<AuthResponse> => {
  'use server';
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });

  return { error: error ? error.message : null };
};

export const registerWithOtp = async ({
  email,
}: FormType): Promise<AuthResponse> => {
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
}: FormType): Promise<AuthResponse> => {
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
    await identifyUser(supabase);
  }

  return { error: error ? error.message : null };
};

async function identifyUser(supabase: ReturnType<typeof createClient>) {
  const { data: userData } = await supabase.auth.getUser();

  if (userData && userData.user) {
    const { data: planData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    analytics.identify(userData.user.id, {
      email: userData.user.email,
      plan: planData?.plan,
    });
  }
}
