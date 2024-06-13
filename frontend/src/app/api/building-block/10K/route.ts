import { NextResponse } from 'next/server';
import { generate10KBlock } from '../blocks';

// TODO: check if this is authenticated
export async function POST(req: Request) {
  const { blockId, customPrompt, companyName, pdfData } = await req.json();

  console.log('generating block ' + blockId);

  const block = await generate10KBlock(
    blockId,
    customPrompt,
    companyName,
    pdfData,
  );

  return NextResponse.json({ block: block });
}
