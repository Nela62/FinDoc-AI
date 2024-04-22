import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { prefetchQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { Editor } from '@tiptap/react';

import '@/styles/index.css';
import { tickers } from '@/lib/data/tickers';
import { getPrompts } from './prompts';
export type AiState = {
  isAiLoading: boolean;
  aiError?: string | null;
};
import { EditorComponent } from './components/EditorComponent';
import { createClient } from '@/lib/supabase/server';
import { fetchCitations, fetchDocuments, fetchReportById } from '@/lib/queries';
import { redirect } from 'next/navigation';
import { ReportPage } from './components/ReportPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coreline - View Report',
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

  await prefetchQuery(queryClient, fetchReportById(supabase, params.url));
  await prefetchQuery(queryClient, fetchCitations(supabase, params.url));
  await prefetchQuery(queryClient, fetchDocuments(supabase));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReportPage url={params.url} />
    </HydrationBoundary>
  );
}
