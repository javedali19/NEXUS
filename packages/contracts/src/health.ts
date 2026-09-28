export interface HealthLiveResponse {
  status: 'alive';
  service: string;
  uptime_seconds: number;
  timestamp: string;
}

export interface ComponentCheck {
  status: 'up' | 'down' | 'degraded';
  latency_ms?: number;
  message?: string;
}

export interface HealthReadyResponse {
  status: 'ready' | 'not_ready';
  service: string;
  checks: {
    database: ComponentCheck;
    pubsub?: ComponentCheck;
    redis?: ComponentCheck;
  };
  timestamp: string;
}
