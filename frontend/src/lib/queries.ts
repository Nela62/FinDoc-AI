import { TypedSupabaseClient } from '../types/supabase';

export function fetchDemoReports(client: TypedSupabaseClient) {
  return client.from('demo_reports').select('*').throwOnError();
}

export function fetchReportById(client: TypedSupabaseClient, url: string) {
  return client
    .from('demo_reports')
    .select('*')
    .eq('url', url)
    .throwOnError()
    .single();
}

export function fetchCitations(client: TypedSupabaseClient, url: string) {
  return client
    .from('demo_citations')
    .select('node_id, text, source_num, page, doc_id')
    .eq('report_url', url)
    .throwOnError();
}

export function fetchFile(client: TypedSupabaseClient, url: string) {
  // return client.storage.from('public').createSignedUrl(url, 60);
  return client.storage.from('sec-filings').download(url);
}

export function fetchDocuments(client: TypedSupabaseClient) {
  return client.from('documents').select('*').throwOnError();
}
