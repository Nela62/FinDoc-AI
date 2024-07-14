import { serviceClient } from '@/lib/supabase/service';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = serviceClient();
  const { tickers } = await req.json();

  try {
    await supabase.from('companies').update(tickers);
  } catch (err) {
    console.error(err);
  }

  return NextResponse.json({}, { status: 200 });
}
