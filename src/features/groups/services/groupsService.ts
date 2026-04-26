import {
	getGroups,
	createGroup,
	updateGroup,
	deleteGroup,
	deleteAllGroups
} from '$lib/supabase/groups';
import { getRounds, getRoundsByUserId, createRounds } from '$lib/supabase/rounds';
import { ROUND_STATUS, PAYOUT_STATUS } from '$features/groups/types';
import type { Group, Round, RoundStatus, PayoutStatus } from '$features/groups/types';

type SupabaseRoundRow = Awaited<ReturnType<typeof getRounds>>[number];
type SupabaseGroupRow = Awaited<ReturnType<typeof getGroups>>[number];

export function mapRoundRow(r: SupabaseRoundRow): Round {
	return {
		roundNumber: r.round_number,
		date: r.date,
		paymentAmount: r.payment_amount,
		receiveAmount: r.receive_amount,
		status: (r.status ?? ROUND_STATUS.PENDING) as RoundStatus,
		paidAt: r.paid_at ?? undefined,
		payoutStatus: (r.payout_status ?? PAYOUT_STATUS.PENDING) as PayoutStatus,
		receivedAt: r.received_at ?? undefined,
		isMyRound: r.is_my_round ?? false,
		managementFee: r.management_fee ?? 0
	};
}

export function mapGroupRow(g: SupabaseGroupRow, rounds: Round[]): Group {
	return {
		id: g.id,
		name: g.name,
		rounds,
		createdAt: g.created_at ?? '',
		isActive: g.is_active ?? true,
		managementFeePerRound: undefined
	};
}

export async function fetchGroupsWithRounds(userId: string): Promise<Group[]> {
	const [groupsData, roundsData] = await Promise.all([
		getGroups(userId),
		getRoundsByUserId(userId)
	]);

	const roundsByGroupId: Record<string, Round[]> = {};
	for (const r of roundsData) {
		if (!roundsByGroupId[r.group_id]) roundsByGroupId[r.group_id] = [];
		roundsByGroupId[r.group_id].push(mapRoundRow(r));
	}

	return groupsData.map((g) => mapGroupRow(g, roundsByGroupId[g.id] ?? []));
}

export async function fetchRoundsForGroup(groupId: string): Promise<Round[]> {
	const data = await getRounds(groupId);
	return data.map(mapRoundRow);
}

export async function createGroupWithRounds(
	userId: string,
	group: Omit<Group, 'id' | 'createdAt'>
): Promise<Group> {
	const data = await createGroup({
		user_id: userId,
		name: group.name,
		is_active: group.isActive ?? true
	});

	if (group.rounds && group.rounds.length > 0) {
		const roundsToInsert = group.rounds.map((round) => ({
			group_id: data.id,
			round_number: round.roundNumber,
			date: round.date,
			payment_amount: round.paymentAmount,
			receive_amount: round.receiveAmount,
			status: round.status ?? ROUND_STATUS.PENDING,
			paid_at: round.paidAt ?? null,
			payout_status: round.payoutStatus ?? PAYOUT_STATUS.PENDING,
			received_at: round.receivedAt ?? null,
			is_my_round: round.isMyRound ?? false,
			management_fee: round.managementFee ?? 0
		}));
		try {
			await createRounds(roundsToInsert);
		} catch (error) {
			await deleteGroup(data.id).catch((e) => {
				console.error('Compensation deleteGroup failed for group', data.id, e);
			});
			throw error;
		}
	}

	return {
		id: data.id,
		name: data.name,
		rounds: group.rounds ?? [],
		createdAt: data.created_at ?? '',
		isActive: data.is_active ?? true
	};
}

export async function updateGroupFields(
	id: string,
	updates: Partial<Pick<Group, 'name' | 'isActive'>>
): Promise<void> {
	await updateGroup(id, {
		name: updates.name,
		is_active: updates.isActive
	});
}

export async function removeGroup(id: string): Promise<void> {
	await deleteGroup(id);
}

export async function removeAllGroups(userId: string): Promise<void> {
	await deleteAllGroups(userId);
}
