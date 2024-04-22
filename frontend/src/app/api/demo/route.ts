import { initialContent } from '@/lib/data/initialContent';
import { serviceClient } from '@/lib/supabase/service';

export async function GET(req: Request) {
  // const { id, content } = await req.json();

  // const supabase = serviceClient();
  // const url = await supabase.storage
  //   .from('sec-filings')
  //   .createSignedUrl(
  //     'sec-edgar-filings/0001018724/10-K/0001018724-24-000008/primary-document.pdf',
  //     3600,
  //   );
  // console.log(url);
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
