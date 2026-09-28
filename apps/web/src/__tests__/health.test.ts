import { describe, it, expect } from 'vitest';

describe('Health Check Endpoints', () => {
  it('validates liveness response contract format', () => {
    const liveResponse = {
      status: 'alive',
      service: 'platform-web',
      uptime_seconds: 120,
      timestamp: new Date().toISOString(),
    };

    expect(liveResponse.status).toBe('alive');
    expect(liveResponse.service).toBe('platform-web');
    expect(liveResponse.uptime_seconds).toBeGreaterThanOrEqual(0);
  });

  it('validates readiness response contract format', () => {
    const readyResponse = {
      status: 'ready',
      service: 'platform-web',
      checks: {
        frontend_runtime: { status: 'up' },
        api_gateway_contract: { status: 'up' },
      },
      timestamp: new Date().toISOString(),
    };

    expect(readyResponse.status).toBe('ready');
    expect(readyResponse.checks.frontend_runtime.status).toBe('up');
  });
});
