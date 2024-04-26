import { TypedSupabaseClient } from '../types/supabase';

export function fetchDemoReports(client: TypedSupabaseClient) {
  return client.from('reports').select('*').throwOnError();
}

export function fetchReportById(client: TypedSupabaseClient, url: string) {
  return client
    .from('reports')
    .select('*')
    .eq('url', url)
    .throwOnError()
    .single();
}

export function fetchCitations(client: TypedSupabaseClient, url: string) {
  return client
    .from('citations')
    .select('node_id, text, source_num, page, doc_id')
    .eq('report_url', url)
    .throwOnError();
}

// TODO: experiment with using a signedUrl instead
export function fetchFile(client: TypedSupabaseClient, url: string) {
  // return client.storage.from('sec-filings').createSignedUrl(url, 36000);
  return fetch('/api/document', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

// TODO: can I make it better?
export function fetchDocuments(client: TypedSupabaseClient, url: string) {
  return client
    .from('documents_reports')
    .select('documents (*), reports (url)')
    .eq('reports.url', url)
    .throwOnError();
}
