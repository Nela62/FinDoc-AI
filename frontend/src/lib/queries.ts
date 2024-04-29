import { TypedSupabaseClient } from '../types/supabase';

export function fetchAllReports(client: TypedSupabaseClient) {
  return client
    .from('reports')
    .select(
      'id, user_id, title, company_ticker, type, recommendation, targetprice, status, created_at, updated_at, url, html_content, json_content',
    )
    .throwOnError();
}

export function getReportIdByUrl(client: TypedSupabaseClient, url: string) {
  return client
    .from('reports')
    .select('id')
    .eq('url', url)
    .throwOnError()
    .maybeSingle();
}

export function fetchReportByUrl(client: TypedSupabaseClient, url: string) {
  return client
    .from('reports')
    .select(
      'id, user_id, title, company_ticker, type, recommendation, targetprice, status, created_at, updated_at, url, html_content, json_content',
    )
    .eq('url', url)
    .throwOnError()
    .maybeSingle();
}

export function fetchReportById(client: TypedSupabaseClient, id: string) {
  return client
    .from('reports')
    .select(
      'id, user_id, title, company_ticker, type, recommendation, targetprice, status, created_at, updated_at, url, html_content, json_content',
    )
    .eq('id', id)
    .throwOnError()
    .maybeSingle();
}

export function fetchCitations(client: TypedSupabaseClient, id: string) {
  return client
    .from('citations')
    .select('id, node_id, text, source_num, page, doc_id')
    .eq('report_id', id)
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
export function fetchDocuments(client: TypedSupabaseClient, id: string) {
  return (
    client
      .from('documents')
      .select(
        'id, url, company_name, company_ticker, accession_number, doc_type, year, quarter, created_at, updated_at, cik, period_of_report_date, filed_as_of_date, date_as_of_change, reports (id, url)',
      )
      // .eq('reports.id', id)
      .throwOnError()
  );
}
