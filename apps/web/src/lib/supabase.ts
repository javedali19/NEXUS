/**
 * Supabase Client Integration Module
 * Strictly conforms to Security Rule 5 & 6:
 * - NEVER expose SUPABASE_SERVICE_ROLE_KEY to frontend code or client JS.
 * - Only uses public SUPABASE_URL and SUPABASE_ANON_KEY on the client.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export class SupabaseRestClient {
  private url: string;
  private anonKey: string;

  constructor(config: SupabaseConfig) {
    this.url = config.url.replace(/\/$/, "");
    this.anonKey = config.anonKey;
  }

  public async query<T = any>(table: string, options: { select?: string; filter?: Record<string, string> } = {}): Promise<T[]> {
    const select = options.select || "*";
    let endpoint = `${this.url}/rest/v1/${table}?select=${encodeURIComponent(select)}`;

    if (options.filter) {
      for (const [key, value] of Object.entries(options.filter)) {
        endpoint += `&${encodeURIComponent(key)}=eq.${encodeURIComponent(value)}`;
      }
    }

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "apikey": this.anonKey,
        "Authorization": `Bearer ${this.anonKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase query error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

let clientInstance: SupabaseRestClient | null = null;

export function getSupabaseClient(): SupabaseRestClient | null {
  if (clientInstance) return clientInstance;
  const config = getSupabaseConfig();
  if (!config) return null;
  clientInstance = new SupabaseRestClient(config);
  return clientInstance;
}
