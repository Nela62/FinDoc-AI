import { Metadata } from 'next';

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { prefetchQuery } from '@supabase-cache-helpers/postgrest-react-query';

import { createClient } from '@/lib/supabase/server';

import { Settings } from './Settings';
import { redirect } from 'next/navigation';
import { fetchSettings } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Findoc - Settings',
};

export default async function SettingsPage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();
  const supabase = createClient();

  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return redirect('/login');
  }

  if (data && data.user) {
    await prefetchQuery(queryClient, fetchSettings(supabase));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Settings>{children}</Settings>
    </HydrationBoundary>
  );
}
