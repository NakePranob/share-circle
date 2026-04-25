import { supabase } from '$lib/supabase/client';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import type { Session, User } from '@supabase/supabase-js';
import liff from '@line/liff';

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
			const { data, error } = await supabase.auth.signUp({
				email,
				password
			});

			if (error) throw error;

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
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (error) throw error;

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
			const { error } = await supabase.auth.signOut();

			if (error) throw error;

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
			const { error } = await supabase.auth.resetPasswordForEmail(email);

			if (error) throw error;

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

			if (!liff.ready) {
				await liff.init({ liffId });
			}

			if (!liff.isLoggedIn()) {
				liff.login();
				return { success: false };
			}

			const lineAccessToken = liff.getAccessToken();
			if (!lineAccessToken) throw new Error('ไม่พบ LINE access token');

			const res = await fetch('/api/auth/line/callback', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ lineAccessToken })
			});

			if (!res.ok) {
				const errBody = await res.json().catch(() => ({}));
				throw new Error(errBody.message ?? 'LINE login failed');
			}

			const { access_token, refresh_token } = await res.json();
			const { error: setErr } = await supabase.auth.setSession({ access_token, refresh_token });
			if (setErr) throw setErr;

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
