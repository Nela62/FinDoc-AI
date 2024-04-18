import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../lib/utils/supabase/database.types';

export type TypedSupabaseClient = SupabaseClient<Database>;
