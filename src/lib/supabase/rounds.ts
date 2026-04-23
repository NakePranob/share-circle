import { supabase } from './client';
import type { Database } from './database.types';

export type Round = Database['public']['Tables']['rounds']['Row'];
export type RoundInsert = Database['public']['Tables']['rounds']['Insert'];
export type RoundUpdate = Database['public']['Tables']['rounds']['Update'];

export async function getRounds(groupId: string) {
	const { data, error } = await supabase
		.from('rounds')
		.select('*')
		.eq('group_id', groupId)
		.order('round_number', { ascending: true });

	if (error) throw error;
	return data;
}

export async function getRoundsByUserId(userId: string) {
	// Get all group IDs for the user
	const { data: groups, error: groupsError } = await supabase
		.from('groups')
		.select('id')
		.eq('user_id', userId);

	if (groupsError) throw groupsError;
	if (!groups || groups.length === 0) return [];

	// Get all rounds for those groups in a single query
	const groupIds = groups.map((g) => g.id);
	const { data, error } = await supabase
		.from('rounds')
		.select('*')
		.in('group_id', groupIds)
		.order('group_id', { ascending: true })
		.order('round_number', { ascending: true });

	if (error) throw error;
	return data || [];
}

export async function getRoundById(id: string) {
	const { data, error } = await supabase.from('rounds').select('*').eq('id', id).single();

	if (error) throw error;
	return data;
}

export async function createRound(round: RoundInsert) {
	const { data, error } = await supabase.from('rounds').insert(round).select().single();

	if (error) throw error;
	return data;
}

export async function createRounds(rounds: RoundInsert[]) {
	const { data, error } = await supabase.from('rounds').insert(rounds).select();

	if (error) throw error;
	return data;
}

export async function updateRound(id: string, updates: RoundUpdate) {
	const { data, error } = await supabase
		.from('rounds')
		.update(updates)
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function deleteRound(id: string) {
	const { error } = await supabase.from('rounds').delete().eq('id', id);

	if (error) throw error;
}

export async function updateRoundStatus(id: string, status: 'pending' | 'paid') {
	const { data, error } = await supabase
		.from('rounds')
		.update({ status, paid_at: status === 'paid' ? new Date().toISOString() : null })
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function updatePayoutStatus(id: string, payoutStatus: 'pending' | 'received') {
	const { data, error } = await supabase
		.from('rounds')
		.update({ payout_status: payoutStatus, received_at: payoutStatus === 'received' ? new Date().toISOString() : null })
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data;
}
