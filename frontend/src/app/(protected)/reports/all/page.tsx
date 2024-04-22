import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { prefetchQuery } from '@supabase-cache-helpers/postgrest-react-query';

import { createClient } from '@/lib/supabase/server';
import { AllReportsTable } from './AllReportsTable';
import { fetchDemoReports } from '@/lib/queries';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

// TODO: add table pagination
// TODO: add tabler filtering
// TODO: add export functionality

export const metadata: Metadata = {
  title: 'Coreline - View All Reports',
  description: 'Supercharge your financial report generation',
};

export default async function ReportsPage() {
  const queryClient = new QueryClient();
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // @ts-ignore
  // BUG: waiting for fix
  // https://github.com/supabase/auth-js/issues/872
  if (data && data.user && data.user.is_anonymous) {
    await prefetchQuery(queryClient, fetchDemoReports(supabase));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AllReportsTable />
    </HydrationBoundary>
  );
}
