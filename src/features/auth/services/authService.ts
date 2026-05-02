import { supabase } from '$lib/supabase/client';
import liff from '@line/liff';

export async function signUpWithEmail(email: string, password: string) {
	const { data, error } = await supabase.auth.signUp({ email, password });
	if (error) throw error;
	return data;
}

export async function signInWithEmail(email: string, password: string) {
	const { data, error } = await supabase.auth.signInWithPassword({ email, password });
	if (error) throw error;
	return data;
}

export async function signOutSession() {
	const { error } = await supabase.auth.signOut();
	if (error) throw error;
}

export async function requestPasswordReset(email: string) {
	const { error } = await supabase.auth.resetPasswordForEmail(email);
	if (error) throw error;
}

export async function exchangeLineToken(liffId: string) {
	if (!liff.ready) {
		await liff.init({ liffId });
	}

	if (!liff.isLoggedIn()) {
		liff.login();
		return null;
	}

	const lineAccessToken = liff.getAccessToken();
	if (!lineAccessToken) throw new Error('ไม่พบ LINE access token');

	const lineProfile = await liff.getProfile();
	console.log('[LINE login] profile:', lineProfile);
	// เพิ่มการตรวจสอบว่าถึงบรรทัดนี้จริง
	alert(`LINE Profile: ${JSON.stringify(lineProfile, null, 2)}`);

	// const res = await fetch('/api/auth/line/callback', {
	// 	method: 'POST',
	// 	headers: { 'Content-Type': 'application/json' },
	// 	body: JSON.stringify({ lineAccessToken })
	// });

	// if (!res.ok) {
	// 	const errBody = await res.json().catch(() => ({}));
	// 	throw new Error((errBody as { message?: string }).message ?? 'LINE login failed');
	// }

	// const { access_token, refresh_token } = (await res.json()) as {
	// 	access_token: string;
	// 	refresh_token: string;
	// };
	// const { error: setErr } = await supabase.auth.setSession({ access_token, refresh_token });
	// if (setErr) throw setErr;
}
