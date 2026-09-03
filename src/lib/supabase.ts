import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://qpjmoehdcqzwmbzvuopu.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwam1vZWhkY3F6d21ienZ1b3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NjU0ODUsImV4cCI6MjEwNDA0MTQ4NX0.nSRe41k-qpTgpzPm_8FVArGZZx7xTGE_lilYyfatoi0';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-supabase')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
