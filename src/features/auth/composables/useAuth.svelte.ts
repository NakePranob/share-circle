import { supabase } from '$lib/supabase/client';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import type { Session, User } from '@supabase/supabase-js';

export function useAuth() {
	let loading = $state(false);
	let session = $state<Session | null>(null);
	let user = $state<User | null>(null);

	// Initialize auth state
	async function initAuth() {
		if (!browser) return;
		const {
			data: { session: currentSession }
		} = await supabase.auth.getSession();
		session = currentSession;
		user = currentSession?.user ?? null;
	}

	// Initialize auth on first render
	$effect.pre(() => {
		if (browser) {
			initAuth();
		}
	});

	// Listen for auth changes - use $effect.root to run only once
	$effect.root(() => {
		if (!browser) return;

		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
			session = newSession;
			user = newSession?.user ?? null;
		});

		return () => subscription.unsubscribe();
	});

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

	return {
		get loading() {
			return loading;
		},
		get user() {
			return user;
		},
		get session() {
			return session;
		},
		get isAuthenticated() {
			return !!user;
		},
		get userId() {
			return user?.id;
		},
		signUp,
		signIn,
		signOut,
		resetPassword
	};
}
