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

// TODO: add table pagination
// TODO: add tabler filtering
// TODO: add export functionality

export default async function ReportsPage() {
  const queryClient = new QueryClient();
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error(error);
    throw new Error('Failed to fetch user');
  }

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
