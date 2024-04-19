import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../lib/supabase/database.types';

export type TypedSupabaseClient = SupabaseClient<Database>;
