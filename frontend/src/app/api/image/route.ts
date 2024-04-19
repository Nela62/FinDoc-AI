import { createServerServiceClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createServerServiceClient();
  const formData = await req.formData();
  const img = formData.get('img');

  const bucket = await supabase.storage.getBucket('images');
  if (!bucket.data) {
    await supabase.storage.createBucket('images');
  }

  if (!img || !(img instanceof File)) {
    return Response.error();
  }

  const imageName = new Date().getTime() + '_' + img.name;
  const res = await supabase.storage
    .from('images')
    .upload(imageName, img, { contentType: img.type });
  console.log(res?.data?.path);
  return Response.json({ url: res?.data?.path ?? '' });
}
