import { createClient } from "@supabase/supabase-js";

// Browser-side Supabase client using the anon key.
// Used ONLY for Supabase Realtime subscriptions (auto-logout).
// All DB writes go through server actions / API routes with the service role key.
export function getBrowserSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
