import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    service: 'platform-web',
    checks: {
      frontend_runtime: { status: 'up' },
      api_gateway_contract: { status: 'up' },
    },
    timestamp: new Date().toISOString(),
  });
}
