'use server';

import { redirect } from 'next/navigation';
import { formType } from './AuthForm';
import { createClient } from '@/lib/supabase/server';

export async function onDemoSubmit(values: formType) {
  if (values.password !== process.env.DEMO_PASSWORD) {
    return redirect('/login?message=Incorrect password');
  }

  const supabase = createClient();

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.log(error);
    return redirect('/login?message=Could not authenticate user');
  }

  return redirect('/reports/all');
}
