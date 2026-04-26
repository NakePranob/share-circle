import {
	getRounds,
	updateRound,
	updateRoundStatus,
	updatePayoutStatus
} from '$lib/supabase/rounds';
import type { RoundUpdate } from '$lib/supabase/rounds';

export async function findRoundRowId(groupId: string, roundNumber: number): Promise<string> {
	const rounds = await getRounds(groupId);
	const row = rounds.find((r) => r.round_number === roundNumber);
	if (!row) throw new Error(`Round ${roundNumber} not found in group ${groupId}`);
	return row.id;
}

export async function setRoundPaid(groupId: string, roundNumber: number): Promise<void> {
	const id = await findRoundRowId(groupId, roundNumber);
	await updateRoundStatus(id, 'paid');
}

export async function setRoundPending(groupId: string, roundNumber: number): Promise<void> {
	const id = await findRoundRowId(groupId, roundNumber);
	await updateRoundStatus(id, 'pending');
}

export async function setRoundReceived(groupId: string, roundNumber: number): Promise<void> {
	const id = await findRoundRowId(groupId, roundNumber);
	await updatePayoutStatus(id, 'received');
}

export async function setRoundReceivedPending(groupId: string, roundNumber: number): Promise<void> {
	const id = await findRoundRowId(groupId, roundNumber);
	await updatePayoutStatus(id, 'pending');
}

export async function updateRoundFields(id: string, updates: RoundUpdate): Promise<void> {
	await updateRound(id, updates);
}
