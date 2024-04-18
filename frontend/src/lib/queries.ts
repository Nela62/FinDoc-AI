import { TypedSupabaseClient } from '../types/supabase';

export function getDemoReports(client: TypedSupabaseClient) {
  return client.from('demo_reports').select('*').throwOnError();
}
