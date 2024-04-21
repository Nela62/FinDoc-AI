import { initialContent } from '@/lib/data/initialContent';
import { serviceClient } from '@/lib/supabase/service';

export async function GET(req: Request) {
  // const { id, content } = await req.json();

  // const supabase = serviceClient();
  // const { data, error } = await supabase
  //   .from('demo_citations')
  //   // .select('*')
  //   .select('node_id, text, source_num, page, doc_id')
  //   .eq('report_url', 'c6TWdN9N9k')
  //   .throwOnError();

  // const { data, error } = await supabase
  //   .from('demo_reports')
  //   .update({ json_content: initialContent })
  //   .eq('id', id);

  // const { data: data1, error: error1 } = await supabase
  //   .from('demo_citations')
  //   .insert(citations);

  return Response.json({ data: 'success' });
}
