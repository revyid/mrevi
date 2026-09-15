import { createClient } from "@supabase/supabase-js";

// Supabase client dengan service_role_key (full access, bypass RLS)
export function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string | null;
  role: string;
  avatar_url: string;
  provider: string;
  username?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}
