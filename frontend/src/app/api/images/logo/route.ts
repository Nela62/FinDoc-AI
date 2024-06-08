import { serviceClient } from '@/lib/supabase/service';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log('called the api');

  const supabase = serviceClient();
  const formData = await req.formData();
  const img = formData.get('img');
  const cik = formData.get('cik');

  if (!img || !(img instanceof File)) {
    return Response.error();
  }

  try {
    const res = await supabase.storage
      .from('public-company-logos')
      .upload(`${cik}/logo.png`, img, { contentType: 'image/png' });
  } catch (err) {
    console.error(err);
  }

  return NextResponse.json({}, { status: 200 });
}
