import { typecast } from 'zod';
import { TypedSupabaseClient } from '../types/supabase';

export function fetchAllReports(client: TypedSupabaseClient) {
  return client
    .from('reports')
    .select(
      'id, user_id, title, company_ticker, type, recommendation, targetprice, status, created_at, updated_at, url, html_content, json_content',
    )
    .throwOnError();
}

export function getReportIdByUrl(
  client: TypedSupabaseClient,
  reportUrl: string,
) {
  return client
    .from('reports')
    .select('id')
    .eq('url', reportUrl)
    .throwOnError()
    .maybeSingle();
}

export function fetchReportByUrl(
  client: TypedSupabaseClient,
  reportUrl: string,
) {
  return client
    .from('reports')
    .select(
      'id, user_id, title, company_ticker, type, recommendation, targetprice, status, created_at, updated_at, url, html_content, json_content',
    )
    .eq('url', reportUrl)
    .throwOnError()
    .maybeSingle();
}

export function fetchReportById(client: TypedSupabaseClient, reportId: string) {
  return client
    .from('reports')
    .select(
      'id, user_id, title, company_ticker, type, recommendation, targetprice, status, created_at, updated_at, url, html_content, json_content',
    )
    .eq('id', reportId)
    .throwOnError()
    .maybeSingle();
}

export function fetchCitedDocuments(
  client: TypedSupabaseClient,
  reportId: string,
) {
  return client
    .from('cited_documents')
    .select(
      'id, source_num, top_title, bottom_title, citation_type, last_refreshed, doc_id, cache_id, user_id, report_id, created_at, updated_at',
    )
    .eq('report_id', reportId)
    .throwOnError();
}

export function fetchCitationSnippets(
  client: TypedSupabaseClient,
  reportId: string,
) {
  return client
    .from('citation_snippets')
    .select(
      'id, source_num, title, text_snippet, cited_document_id, user_id, report_id, created_at, updated_at, last_refreshed, cited_documents (id, citation_type)',
    )
    .eq('cited_documents.report_id', reportId)
    .throwOnError();
}

export function fetchCitationSnippetById(
  client: TypedSupabaseClient,
  citationSnippetId: string,
) {
  return client
    .from('citation_snippets')
    .select('id, source_num')
    .eq('id', citationSnippetId)
    .throwOnError();
}

export function fetchPDFCitation(
  client: TypedSupabaseClient,
  citationSnippetId: string,
) {
  return client
    .from('pdf_citations')
    .select('id, node_id, text, page, doc_id, citation_snippet_id')
    .eq('citation_snippet_id', citationSnippetId)
    .throwOnError();
}

export function fetchAPICitationById(
  client: TypedSupabaseClient,
  citationSnippetId: string,
) {
  return client
    .from('api_citations')
    .select(
      'api_provider, used_json_data, api_cache (json_data, endpoint, api_provider, accessed_at)',
    )
    .eq('citation_snippet_id', citationSnippetId)
    .throwOnError();
}

export function fetchAPICacheById(
  client: TypedSupabaseClient,
  cacheId: string,
) {
  return client
    .from('api_cache')
    .select('id, json_data, endpoint, api_provider, accessed_at')
    .eq('id', cacheId)
    .throwOnError();
}

export function fetchAPICacheByEndpoint(
  client: TypedSupabaseClient,
  reportId: string,
  endpoint: string,
  api_provider: string,
) {
  return client
    .from('api_cache')
    .select('id, json_data, endpoint, api_provider, accessed_at')
    .eq('report_id', reportId)
    .eq('endpoint', endpoint)
    .eq('api_provider', api_provider)
    .throwOnError();
}

// export function fetchNewsCitation(client: TypedSupabaseClient, citationSnippetId: string) {
//   return client
//     .from('news_citations')
//     .select(
//       'url, text, title, author, published_at, last_access, overall_sentiment_score, overall_sentiment_label, ticker_sentiment',
//     )
//     .eq('citation_snippet_id', citationSnippetId)
//     .throwOnError();
// }

// TODO: experiment with using a signedUrl instead
export function fetchFile(client: TypedSupabaseClient, url: string) {
  // return client.storage.from('sec-filings').createSignedUrl(url, 36000);
  return fetch('/api/document', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

// TODO: can I make it better?
export function fetchDocuments(client: TypedSupabaseClient) {
  return client
    .from('documents')
    .select(
      'id, url, company_name, company_ticker, accession_number, doc_type, year, quarter, created_at, updated_at, cik, period_of_report_date, filed_as_of_date, date_as_of_change',
    )
    .throwOnError();
}

export function fetchDocumentById(client: TypedSupabaseClient, docId: string) {
  return client
    .from('documents')
    .select(
      'id, url, company_name, company_ticker, accession_number, doc_type, year, quarter, created_at, updated_at, cik, period_of_report_date, filed_as_of_date, date_as_of_change',
    )
    .eq('id', docId)
    .throwOnError();
}

export function fetchCitedDocumentByPDFId(
  client: TypedSupabaseClient,
  reportId: string,
  docId: string,
) {
  return client
    .from('cited_documents')
    .select(
      'id, source_num, doc_id, citation_snippets(id,  source_num, pdf_citations (id, node_id, doc_id))',
    )
    .eq('report_id', reportId)
    .eq('doc_id', docId)
    .throwOnError();
}

export function fetchCitedDocumentByAPIId(
  client: TypedSupabaseClient,
  reportId: string,
  cacheId: string,
) {
  return client
    .from('cited_documents')
    .select(
      'id, source_num, doc_id, citation_snippets(id, source_num, title, api_citations (id, cache_id, used_json_data))',
    )
    .eq('report_id', reportId)
    .eq('cache_id', cacheId)
    .throwOnError();
}

// export function fetchCitationSnippetsByDocId(
//   client: TypedSupabaseClient,
//   reportId: string,
//   docId: string,
// ) {
//   return client
//     .from('citation_snippets')
//     .select('id, source_num, ')
//     .eq('report_id', reportId)
//     .eq('doc_id', docId)
//     .throwOnError();
// }

export function fetchSettings(client: TypedSupabaseClient) {
  return client
    .from('settings')
    .select('id, author_name, company_name')
    .throwOnError();
}
