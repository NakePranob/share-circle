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

	const { userId: lineUid, displayName, pictureUrl }: LineProfile = await lineRes.json();

	const { data: existingProfile } = await adminSupabase
		.from('line_profiles')
		.select('user_id')
		.eq('line_uid', lineUid)
		.maybeSingle();

	let userId: string;

	if (!existingProfile) {
		const syntheticEmail = `line_${lineUid}@line.sharecircle.local`;
		const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
			email: syntheticEmail,
			email_confirm: true,
			user_metadata: {
				display_name: displayName,
				picture_url: pictureUrl ?? null,
				provider: 'line',
				line_uid: lineUid
			}
		});

		if (createError || !newUser.user) {
			console.error('Failed to create user:', createError);
			error(500, 'Failed to create user');
		}

		userId = newUser.user.id;
	} else {
		userId = existingProfile.user_id;
	}

	await adminSupabase.from('line_profiles').upsert(
		{
			user_id: userId,
			line_uid: lineUid,
			display_name: displayName,
			picture_url: pictureUrl ?? null,
			updated_at: new Date().toISOString()
		},
		{ onConflict: 'user_id' }
	);

	// Generate a magic link for the user's synthetic email, then immediately
	// exchange the hashed_token for a real session — no email is ever sent.
	const { data: existingUser } = await adminSupabase.auth.admin.getUserById(userId);
	if (!existingUser.user) {
		error(500, 'User not found after creation');
	}

	const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
		type: 'magiclink',
		email: existingUser.user.email!
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

	return json({
		access_token: sessionData.session.access_token,
		refresh_token: sessionData.session.refresh_token,
		expires_at: sessionData.session.expires_at
	});
};
