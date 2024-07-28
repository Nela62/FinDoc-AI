import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const blob = await fetch(
    'https://finpanel-media.nyc3.cdn.digitaloceanspaces.com/default-equity-analyst-template.pdf',
  ).then((res) => res.blob());

  const headers = new Headers();
  headers.set('Content-Type', 'application/pdf');

  return new NextResponse(blob, { status: 200, statusText: 'OK', headers });
}
