import { serviceClient } from '@/lib/supabase/service';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = serviceClient();
  const { src, cik, format, name } = await req.json();

  const blob = await fetch(src).then((res) => res.blob());

  try {
    const res = await supabase.storage
      .from('public-company-logos')
      .upload(`${cik}/${name}`, blob, { contentType: `image/${format}` });
  } catch (err) {
    console.error(err);
  }

  return NextResponse.json({}, { status: 200 });
}
