import { createClient } from '@/lib/supabase/client';
import {
  useInsertMutation,
  useUpdateMutation,
} from '@supabase-cache-helpers/postgrest-react-query';

export function useReportMutations() {
  const supabase = createClient();

  const { mutateAsync: insertNewReport } = useInsertMutation(
    supabase.from('reports'),
    ['id'],
    'id, url',
  );

  const { mutateAsync: updateReport } = useUpdateMutation(
    supabase.from('reports'),
    ['id'],
    'id, url',
  );

  const { mutateAsync: insertTemplate } = useInsertMutation(
    supabase.from('report_template'),
    ['id'],
    'id',
  );

  const { mutateAsync: updateTemplate } = useUpdateMutation(
    supabase.from('report_template'),
    ['id'],
    'id',
  );

  const { mutateAsync: insertCache } = useInsertMutation(
    supabase.from('api_cache'),
    ['id'],
    'id',
  );

  return {
    insertNewReport,
    updateReport,
    insertTemplate,
    updateTemplate,
    insertCache,
  };
}
