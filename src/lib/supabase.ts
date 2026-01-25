import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Database features will not work.');
}

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Workaround for "AbortError: signal is aborted without reason" in dev/HMR
      // Forces the client to bypass navigator.locks if they are causing issues.
      // We pass a custom lock function that just runs the callback immediately.
      lock: (_name, _acquireTimeout, fn) => {
         return fn();
      },
      debug: false
    },
  }
);
