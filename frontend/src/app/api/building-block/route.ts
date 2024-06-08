import { serviceClient } from '@/lib/supabase/service';
import { NextResponse } from 'next/server';
import { generateBlock } from './blocks';

// TODO: check if this is authenticated
export async function POST(req: Request) {
  const { blockId, customPrompt, companyName, apiData } = await req.json();

  const block = await generateBlock(
    blockId,
    customPrompt,
    companyName,
    apiData,
  );

  return NextResponse.json(block);
}
