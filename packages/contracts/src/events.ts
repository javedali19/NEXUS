export interface CloudEventEnvelope<T = Record<string, unknown>> {
  specversion: '1.0';
  id: string;
  source: string;
  type: string;
  datacontenttype: 'application/json';
  time: string;
  tenantid: string;
  data: T;
}
