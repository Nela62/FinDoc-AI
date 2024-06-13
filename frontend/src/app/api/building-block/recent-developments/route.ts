import { NextResponse } from 'next/server';
import {
  generateInvestmentThesis,
  generateRecentDevelopments,
} from '../blocks';

// TODO: check if this is authenticated
export async function POST(req: Request) {
  const { blockId, customPrompt, companyName, news } = await req.json();

  console.log('generating block ' + blockId);

  const block = await generateRecentDevelopments(
    blockId,
    customPrompt,
    companyName,
    news,
  );

  return NextResponse.json({ block: block });
}
