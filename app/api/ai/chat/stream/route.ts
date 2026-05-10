import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const body     = await request.json();
  const tenantId = request.headers.get('x-tenant-id') ?? '';

  const backendUrl = `${process.env.INTERNAL_API_BASE_URL}/ai/chat/stream`;

  const backendResponse = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id':  tenantId,
    },
    body: JSON.stringify(body),
  });

  if (!backendResponse.ok || !backendResponse.body) {
    return new Response(
      JSON.stringify({ error: 'Backend stream failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return new Response(backendResponse.body, {
    headers: {
      'Content-Type':      'text/event-stream',
      'Cache-Control':     'no-cache',
      'Connection':        'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
