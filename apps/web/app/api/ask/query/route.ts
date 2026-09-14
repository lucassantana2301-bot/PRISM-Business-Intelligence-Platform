import { NextRequest, NextResponse } from 'next/server';
import { executeAskPrismQuery, validateRuntimeRequest } from '@/lib/api/ask_service';
import { AskPrismRequest } from '@/lib/contracts/ask';

export async function POST(req: NextRequest) {
  const requestId = `req-${Math.random().toString(36).substring(2, 10)}`;
  try {
    let body: AskPrismRequest;
    try {
      body = (await req.json()) as AskPrismRequest;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload.', request_id: requestId },
        { status: 400 }
      );
    }

    const validation = validateRuntimeRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, request_id: requestId },
        { status: 400 }
      );
    }

    const response = await executeAskPrismQuery(body);
    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: 'An unexpected processing error occurred.', request_id: requestId },
      { status: 500 }
    );
  }
}
