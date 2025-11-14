import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: 'GIA share workout endpoint - coming soon' }, { status: 501 });
}

