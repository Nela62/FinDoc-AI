import { TypedSupabaseClient } from '../types/supabase';

export function getDemoReports(client: TypedSupabaseClient) {
  return client.from('demo_reports').select('*').throwOnError();
}

export function getReportById(client: TypedSupabaseClient, url: string) {
  return client
    .from('demo_reports')
    .select('*')
    .eq('url', url)
    .throwOnError()
    .single();
}
