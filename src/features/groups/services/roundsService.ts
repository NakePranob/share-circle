import {
	getRounds,
	updateRound,
	updateRoundStatus,
	updatePayoutStatus,
	updateRoundStatusBatch,
	updatePayoutStatusBatch
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

export async function setRoundsPaidBatch(
	items: Array<{ groupId: string; roundNumber: number }>
): Promise<void> {
	const uniqueGroupIds = [...new Set(items.map((item) => item.groupId))];
	const allRounds = await Promise.all(
		uniqueGroupIds.map((groupId) => getRounds(groupId))
	);

	const idMap = new Map<string, string>();
	items.forEach(({ groupId, roundNumber }) => {
		const groupRounds = allRounds.flat().filter((r) => r.group_id === groupId);
		const round = groupRounds.find((r) => r.round_number === roundNumber);
		if (round) {
			idMap.set(`${groupId}-${roundNumber}`, round.id);
		}
	});

	const ids = items
		.map(({ groupId, roundNumber }) => idMap.get(`${groupId}-${roundNumber}`))
		.filter((id): id is string => id !== undefined);

	if (ids.length === 0) return;

	await updateRoundStatusBatch(ids, 'paid');
}

export async function setRoundsReceivedBatch(
	items: Array<{ groupId: string; roundNumber: number }>
): Promise<void> {
	const uniqueGroupIds = [...new Set(items.map((item) => item.groupId))];
	const allRounds = await Promise.all(
		uniqueGroupIds.map((groupId) => getRounds(groupId))
	);

	const idMap = new Map<string, string>();
	items.forEach(({ groupId, roundNumber }) => {
		const groupRounds = allRounds.flat().filter((r) => r.group_id === groupId);
		const round = groupRounds.find((r) => r.round_number === roundNumber);
		if (round) {
			idMap.set(`${groupId}-${roundNumber}`, round.id);
		}
	});

	const ids = items
		.map(({ groupId, roundNumber }) => idMap.get(`${groupId}-${roundNumber}`))
		.filter((id): id is string => id !== undefined);

	if (ids.length === 0) return;

	await updatePayoutStatusBatch(ids, 'received');
}
