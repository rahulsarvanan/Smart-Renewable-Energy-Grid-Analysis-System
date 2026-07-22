import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase credentials in .env. Falling back to Demo Mode.");
}

export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey;
};

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Safely unsubscribes and removes a Supabase Realtime channel
 */
export const removeRealtimeChannel = async (channel: RealtimeChannel | null) => {
  if (!channel) return;
  try {
    await supabase.removeChannel(channel);
  } catch (err) {
    console.warn('Error removing Realtime channel:', err);
  }
};
