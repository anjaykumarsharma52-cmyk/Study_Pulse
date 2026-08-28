import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

function getSupabaseUrl(): string {
  return process.env.SUPABASE_URL || '';
}

function getSupabaseAnonKey(): string {
  return process.env.SUPABASE_ANON_KEY || '';
}

function getSupabaseServiceKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();
    if (!url || !key) {
      throw new Error('Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    const url = getSupabaseUrl();
    const key = getSupabaseServiceKey();
    if (!url || !key) {
      throw new Error('Supabase admin not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }
    supabaseAdminInstance = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdminInstance;
}

// For backward compatibility - lazy getters that throw on access if not configured
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabase()[prop as keyof SupabaseClient];
  },
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient];
  },
});