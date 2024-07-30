import { createClient } from '@/lib/supabase/server';
import { analytics } from '@/lib/segment';
import { AuthFormType } from '@/app/(auth)/components/BaseAuthForm';

interface AuthResponse {
  error: string | null;
}

export const signInWithPassword = async ({
  email,
  password,
}: AuthFormType): Promise<AuthResponse> => {
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
}: AuthFormType): Promise<AuthResponse> => {
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
  name,
}: AuthFormType): Promise<AuthResponse> => {
  'use server';
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  const { data, error: userError } = await supabase.auth.getUser();
  if (data && data.user) {
    await supabase
      .from('profiles')
      .insert({ user_id: data.user.id, plan: 'free', name: name });
  }

  return { error: error ? error.message : null };
};

export const verifyOtp = async ({
  email,
  token,
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
    await identifyUser(supabase);
  }

  return { error: error ? error.message : null };
};

async function identifyUser(supabase: ReturnType<typeof createClient>) {
  const { data: userData } = await supabase.auth.getUser();

  if (userData && userData.user) {
    const { data: planData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    analytics.identify(userData.user.id, {
      email: userData.user.email,
      plan: planData?.plan,
    });
  }
}
