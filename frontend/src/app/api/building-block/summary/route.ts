import { NextResponse } from 'next/server';
import { generateBlock } from '../utils/generateBlock';

// TODO: check if this is authenticated
export async function POST(req: Request) {
  const { reportContent } = await req.json();
}
