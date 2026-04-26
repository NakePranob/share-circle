import { ROUND_STATUS, PAYOUT_STATUS } from '$features/groups/types';
import { TRANSACTION_TYPE } from '$features/wallet/types';
import type { Round } from '$features/groups/types';

export type ImportGroup = Omit<
	{ id: string; name: string; rounds: Round[]; createdAt: string; isActive: boolean },
	'id' | 'createdAt'
> & { id?: string };

export type ImportTransaction = {
	type: string;
	amount: number;
	note: string;
	groupId: string | null;
	roundNumber: number | null;
	date?: string;
};

export type ImportData = {
	groups: ImportGroup[];
	wallet?: {
		initialBalance?: number;
		transactions?: ImportTransaction[];
	};
	rawData: Record<string, unknown>;
};

export function parseImportJSON(json: string): ImportData {
	const data = JSON.parse(json) as Record<string, unknown>;
	const groups = (data.groups as ImportGroup[]) || (data.group ? [data.group as ImportGroup] : []);
	if (!groups.length && !data.group) throw new Error('Invalid data format');
	return {
		groups,
		wallet: data.wallet as ImportData['wallet'],
		rawData: data
	};
}

export function checkDuplicateNames(groups: ImportGroup[], existingNames: string[]): string[] {
	const existing = new Set(existingNames);
	return groups.filter((g) => existing.has(g.name)).map((g) => g.name);
}

export function checkTransactionIntegrity(
	groups: ImportGroup[],
	transactions: ImportTransaction[]
): string[] {
	const missing: string[] = [];
	for (const group of groups) {
		const groupTxns = transactions.filter((t) => t.groupId === group.id);
		const hasMissing = group.rounds.some((round) => {
			if (round.status === ROUND_STATUS.PAID) {
				return !groupTxns.some(
					(t) => t.roundNumber === round.roundNumber && t.type === TRANSACTION_TYPE.PAYMENT
				);
			}
			if (round.isMyRound && round.payoutStatus === PAYOUT_STATUS.RECEIVED) {
				return !groupTxns.some(
					(t) => t.roundNumber === round.roundNumber && t.type === TRANSACTION_TYPE.PAYOUT
				);
			}
			return false;
		});
		if (hasMissing) missing.push(group.name);
	}
	return missing;
}

export function resolveIntegrityConflicts(data: ImportData, groupNames: string[]): ImportData {
	const missingSet = new Set(groupNames);
	const cleanedGroups = data.groups.map((group) => {
		if (!missingSet.has(group.name)) return group;
		return {
			...group,
			rounds: group.rounds.map((r) => ({
				...r,
				status: ROUND_STATUS.PENDING,
				paidAt: undefined,
				payoutStatus: PAYOUT_STATUS.PENDING,
				receivedAt: undefined
			}))
		};
	});

	let cleanedWallet = data.wallet;
	if (data.wallet?.transactions) {
		const affectedIds = new Set(data.groups.filter((g) => missingSet.has(g.name)).map((g) => g.id));
		cleanedWallet = {
			...data.wallet,
			transactions: data.wallet.transactions.filter((t) => !affectedIds.has(t.groupId ?? ''))
		};
	}

	return { ...data, groups: cleanedGroups, wallet: cleanedWallet };
}
