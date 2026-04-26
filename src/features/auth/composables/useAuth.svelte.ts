import { supabase } from '$lib/supabase/client';
import {
	signUpWithEmail,
	signInWithEmail,
	signOutSession,
	requestPasswordReset,
	exchangeLineToken
} from '$features/auth/services/authService';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import type { Session, User } from '@supabase/supabase-js';

// Module-level state — use object so reassignment stays within the same reference
const authState = $state<{ session: Session | null; user: User | null; ready: boolean }>({
	session: null,
	user: null,
	ready: false
});

// Bootstrap once per app lifetime
if (browser) {
	supabase.auth.getSession().then(({ data: { session: s } }) => {
		authState.session = s;
		authState.user = s?.user ?? null;
		authState.ready = true;
	});

	supabase.auth.onAuthStateChange((_event, newSession) => {
		authState.session = newSession;
		authState.user = newSession?.user ?? null;
		authState.ready = true;
	});
}

export function useAuth() {
	let loading = $state(false);

	async function signUp(email: string, password: string) {
		loading = true;
		try {
			const data = await signUpWithEmail(email, password);
			toast.success('สมัครสมาชิกสำเร็จ');
			return { success: true, data };
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'สมัครสมาชิกไม่สำเร็จ');
			return { success: false, error };
		} finally {
			loading = false;
		}
	}

	async function signIn(email: string, password: string) {
		loading = true;
		try {
			const data = await signInWithEmail(email, password);
			toast.success('เข้าสู่ระบบสำเร็จ');
			goto('/');
			return { success: true, data };
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'เข้าสู่ระบบไม่สำเร็จ');
			return { success: false, error };
		} finally {
			loading = false;
		}
	}

	async function signOut() {
		loading = true;
		try {
			await signOutSession();
			toast.success('ออกจากระบบสำเร็จ');
			goto('/auth/login');
			return { success: true };
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'ออกจากระบบไม่สำเร็จ');
			return { success: false, error };
		} finally {
			loading = false;
		}
	}

	async function resetPassword(email: string) {
		loading = true;
		try {
			await requestPasswordReset(email);
			toast.success('ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว');
			return { success: true };
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'ส่งอีเมลไม่สำเร็จ');
			return { success: false, error };
		} finally {
			loading = false;
		}
	}

	async function signInWithLine() {
		loading = true;
		try {
			const liffId = import.meta.env.VITE_LINE_LIFF_ID;
			if (!liffId) throw new Error('LIFF ID not configured');

			const result = await exchangeLineToken(liffId);
			if (result === null) {
				// liff.login() was called — page will redirect
				return { success: false };
			}

			toast.success('เข้าสู่ระบบด้วย LINE สำเร็จ');
			goto('/');
			return { success: true };
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'เข้าสู่ระบบด้วย LINE ไม่สำเร็จ');
			return { success: false, error: err };
		} finally {
			loading = false;
		}
	}

	return {
		get loading() {
			return loading;
		},
		get user() {
			return authState.user;
		},
		get session() {
			return authState.session;
		},
		get isAuthenticated() {
			return !!authState.user;
		},
		get isReady() {
			return authState.ready;
		},
		get userId() {
			return authState.user?.id;
		},
		signUp,
		signIn,
		signOut,
		resetPassword,
		signInWithLine
	};
}
