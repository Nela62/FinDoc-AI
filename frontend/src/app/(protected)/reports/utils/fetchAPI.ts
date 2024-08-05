import { fetchNews } from '@/lib/utils/metrics/financialAPI';
import { NewsData, Overview } from '@/types/alphaVantageApi';
import { Recommendation } from '@/types/report';
import { TypedSupabaseClient } from '@/types/supabase';
import { format, subMonths } from 'date-fns';
