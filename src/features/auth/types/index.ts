import type { Session } from '@supabase/supabase-js';

export type AuthUser = {
	id: string;
	email: string | undefined;
};

export type AuthState = {
	session: Session | null;
	user: AuthUser | null;
	ready: boolean;
};
