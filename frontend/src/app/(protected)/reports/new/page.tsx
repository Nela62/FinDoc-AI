import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { prefetchQuery } from '@supabase-cache-helpers/postgrest-react-query';

import '@/styles/index.css';
import { createClient } from '@/lib/supabase/server';
import { fetchSettings, fetchTickers } from '@/lib/queries';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { NewReportComponent } from './components/NewReport';

export const metadata: Metadata = {
  title: 'Coreline - Create New Report',
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

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NewReportComponent />
    </HydrationBoundary>
  );
}
