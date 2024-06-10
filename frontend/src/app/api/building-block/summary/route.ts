import { NextResponse } from 'next/server';
import { generateSummary } from '../blocks';

// TODO: check if this is authenticated
export async function POST(req: Request) {
  const { reportContent } = await req.json();
  console.log('generating a summary...');
  console.log(reportContent);

  const summary = await generateSummary(reportContent);

  return NextResponse.json({ summary: summary });
}
