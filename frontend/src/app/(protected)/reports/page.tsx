import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { prefetchQuery } from '@supabase-cache-helpers/postgrest-react-query';

import '@/styles/index.css';
import { createClient } from '@/lib/supabase/server';
import {
  fetchAllReports,
  fetchSettings,
  fetchSubscription,
  fetchTemplates,
  fetchTickers,
} from '@/lib/queries';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { NewReport } from './Component';

export const metadata: Metadata = {
  title: 'Finpanel - Create New Report',
  description: 'Supercharge your financial report generation',
};

export default async function NewReportPage() {
  const queryClient = new QueryClient();
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  await prefetchQuery(queryClient, fetchSettings(supabase));
  await prefetchQuery(queryClient, fetchTickers(supabase));
  await prefetchQuery(queryClient, fetchTemplates(supabase));
  await prefetchQuery(queryClient, fetchAllReports(supabase));
  await prefetchQuery(queryClient, fetchSubscription(supabase));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NewReport userId={user.id} />
    </HydrationBoundary>
  );
}
