import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
	auth: {
		// Disable auto-detection so LIFF's ?code= param isn't mistaken for a Supabase PKCE code.
		// The /auth/callback page handles Supabase OAuth exchanges explicitly.
		detectSessionInUrl: false
	}
});
