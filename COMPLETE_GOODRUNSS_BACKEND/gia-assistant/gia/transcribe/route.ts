import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: 'GIA transcribe endpoint - coming soon' }, { status: 501 });
}

