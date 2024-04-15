import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabaseServiceKey = process.env
  .NEXT_PUBLIC_SERVICE_SUPABASE_KEY as string;

export const createClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey);

export const createServiceClient = () =>
  createBrowserClient(supabaseUrl, supabaseServiceKey);
