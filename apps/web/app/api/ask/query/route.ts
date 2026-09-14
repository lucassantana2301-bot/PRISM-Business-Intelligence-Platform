import { NextRequest, NextResponse } from 'next/server';
import { processAskPrismQuery } from '@/lib/api/ask_service';
import { AskPrismRequest } from '@/lib/contracts/ask';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AskPrismRequest;
    if (!body.message || !body.message.trim()) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const response = await processAskPrismQuery(body);
    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Ask PRISM processing failed' },
      { status: 500 }
    );
  }
}
