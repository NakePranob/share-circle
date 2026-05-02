import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { adminSupabase } from '$lib/supabase/admin';

interface LineProfile {
	userId: string;
	displayName: string;
	pictureUrl?: string;
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	const lineAccessToken: string | undefined = body?.lineAccessToken;

	if (!lineAccessToken) {
		error(400, 'Missing lineAccessToken');
	}

	const lineRes = await fetch('https://api.line.me/v2/profile', {
		headers: { Authorization: `Bearer ${lineAccessToken}` }
	});

	if (!lineRes.ok) {
		error(401, 'Invalid LINE access token');
	}

	const lineProfile: LineProfile = await lineRes.json();
	console.log('[LINE callback] profile:', lineProfile);
	const { userId: lineUid, displayName, pictureUrl } = lineProfile;

	const syntheticEmail = `line_${lineUid}@line.sharecircle.local`;

	// Create user if not exists — ignore email_exists (idempotent)
	const { error: createError } = await adminSupabase.auth.admin.createUser({
		email: syntheticEmail,
		email_confirm: true,
		user_metadata: {
			display_name: displayName,
			picture_url: pictureUrl ?? null,
			provider: 'line',
			line_uid: lineUid
		}
	});

	if (createError && createError.code !== 'email_exists') {
		console.error('Failed to create user:', createError);
		error(500, 'Failed to create user');
	}

	// Generate session — works for both new and existing users
	const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
		type: 'magiclink',
		email: syntheticEmail
	});

	if (linkError || !linkData.properties.hashed_token) {
		console.error('Failed to generate link:', linkError);
		error(500, 'Failed to generate session link');
	}

	const { data: sessionData, error: sessionError } = await adminSupabase.auth.verifyOtp({
		token_hash: linkData.properties.hashed_token,
		type: 'magiclink'
	});

	if (sessionError || !sessionData.session) {
		console.error('Failed to verify OTP:', sessionError);
		error(500, 'Failed to create session');
	}

	// Upsert line_profiles using userId from session (no extra lookup needed)
	const userId = sessionData.session.user.id;
	const { error: upsertError } = await adminSupabase.from('line_profiles').upsert(
		{
			user_id: userId,
			line_uid: lineUid,
			display_name: displayName,
			picture_url: pictureUrl ?? null,
			updated_at: new Date().toISOString()
		},
		{ onConflict: 'line_uid' }
	);
	if (upsertError) {
		console.error('[LINE callback] upsert line_profiles failed:', upsertError);
	}

	return json({
		access_token: sessionData.session.access_token,
		refresh_token: sessionData.session.refresh_token,
		expires_at: sessionData.session.expires_at
	});
};
