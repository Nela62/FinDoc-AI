import { serviceClient } from '@/lib/supabase/service';
import { NextResponse } from 'next/server';

// TODO: check if this is authenticated
export async function POST(req: Request) {
  const { url } = await req.json();

  const supabase = serviceClient();
  // const { data, error } = await supabase.storage
  //   .from('sec-filings')
  //   .createSignedUrl(url, 36000);
  const { data, error } = await supabase.storage
    .from('sec-filings')
    .download(url);
  const headers = new Headers();
  console.log(data);

  if (!data || error) {
    return new NextResponse(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }

  headers.set('Content-Type', 'application/pdf');
  headers.set('Content-Length', data.size.toString());

  return new NextResponse(data, {
    status: 200,
    statusText: 'OK',
    headers,
  });

  // return new NextResponse(JSON.stringify({ url: data.signedUrl }));
  // const headers = new Headers();

  // headers.set('Content-Type', 'application/pdf');
  // return new NextResponse(data, { status: 200, statusText: 'OK', headers });
}
