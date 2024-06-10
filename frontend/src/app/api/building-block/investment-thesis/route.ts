import { NextResponse } from 'next/server';
import { generateInvestmentThesis } from '../blocks';

// TODO: check if this is authenticated
export async function POST(req: Request) {
  const {
    blockId,
    customPrompt,
    companyName,
    apiData,
    recommendation,
    targetPrice,
  } = await req.json();

  console.log('generating block ' + blockId);

  const block = await generateInvestmentThesis(
    blockId,
    customPrompt,
    companyName,
    apiData,
    recommendation,
    targetPrice,
  );

  return NextResponse.json({ block: block });
}
