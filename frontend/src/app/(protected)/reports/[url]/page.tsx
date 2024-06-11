import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { prefetchQuery } from '@supabase-cache-helpers/postgrest-react-query';

import '@/styles/index.css';
import { createClient } from '@/lib/supabase/server';
import {
  fetchCitationSnippets,
  fetchCitedDocuments,
  fetchDocuments,
  fetchReportById,
  getReportIdByUrl,
} from '@/lib/queries';
import { redirect } from 'next/navigation';
import { ReportPage } from './components/ReportPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Finpanel - View Report',
  description: 'Supercharge your financial report generation',
};

export default async function Report({ params }: { params: { url: string } }) {
  const queryClient = new QueryClient();
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data, error } = await getReportIdByUrl(supabase, params.url);

  if (!data || error || !data.id) {
    return <div>No report found</div>;
  }

  // TODO: setup library list of documents

  await prefetchQuery(queryClient, fetchReportById(supabase, data.id));
  await prefetchQuery(queryClient, fetchCitedDocuments(supabase, data.id));
  await prefetchQuery(queryClient, fetchCitationSnippets(supabase, data.id));
  await prefetchQuery(queryClient, fetchDocuments(supabase));
  await prefetchQuery(queryClient, getReportIdByUrl(supabase, params.url));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReportPage reportId={data.id} />
    </HydrationBoundary>
  );
}
