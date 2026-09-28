import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'alive',
    service: 'platform-web',
    uptime_seconds: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}
