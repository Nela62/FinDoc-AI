import { serviceClient } from '@/lib/supabase/service';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = serviceClient();
  const formData = await req.formData();
  const img = formData.get('img');

  const bucket = await supabase.storage.getBucket('images');
  if (!bucket.data) {
    await supabase.storage.createBucket('images');
  }

  if (!img || !(img instanceof File)) {
    return NextResponse.error();
  }

  const imageName = new Date().getTime() + '_' + img.name;
  const res = await supabase.storage
    .from('images')
    .upload(imageName, img, { contentType: img.type });

  return NextResponse.json({ url: res?.data?.path ?? '' });
}
