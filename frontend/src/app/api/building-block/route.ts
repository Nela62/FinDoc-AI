import { NextResponse } from 'next/server';
import { getBlock } from './utils/blocks';

// TODO: check if this is authenticated
export async function POST(req: Request) {
  const json = await req.json();

  console.log('generating block ' + json.blockId);

  const block = await getBlock(json);

  return NextResponse.json({ block: block });
}
