import { createGenericStore } from '$lib/stores/genericStore.svelte';
import type { Group, Round } from '$features/groups/types';
import { walletStore } from '$features/wallet/stores/wallet.svelte';
import { iOweForRound } from '$features/groups/utils/calculators';

const genericStore = createGenericStore<Group>({
	key: 'share-circle-groups',
	initial: []
});

function add(group: Omit<Group, 'id' | 'createdAt'>): Group {
	const full: Group = {
		...group,
		id: crypto.randomUUID(),
		createdAt: new Date().toISOString()
	};
	return genericStore.add(full);
}

function updateRound(groupId: string, roundNumber: number, partial: Partial<Round>): void {
	genericStore.update(groupId, (g) => ({
		...g,
		rounds: g.rounds.map((r) => (r.roundNumber === roundNumber ? { ...r, ...partial } : r))
	}));
}

function markRoundPaid(groupId: string, roundNumber: number): void {
	const group = genericStore.getById(groupId);
	if (!group) return;
	const round = group.rounds.find((r) => r.roundNumber === roundNumber);
	if (!round) return;

	const owe = iOweForRound(group);
	walletStore.addTransaction('payment', owe, `${group.name} มือ ${roundNumber}`);
	updateRound(groupId, roundNumber, { status: 'paid' });
}

function markRoundReceived(groupId: string, roundNumber: number): void {
	const group = genericStore.getById(groupId);
	if (!group) return;
	const round = group.rounds.find((r) => r.roundNumber === roundNumber);
	if (!round) return;

	walletStore.addTransaction('payout', round.receiveAmount, `${group.name} มือ ${roundNumber} — รับเงิน`);
	updateRound(groupId, roundNumber, { payoutStatus: 'received' });
}

function markRoundPending(groupId: string, roundNumber: number): void {
	updateRound(groupId, roundNumber, { status: 'pending' });
}

function toggleActive(id: string): void {
	genericStore.update(id, (g) => ({ ...g, isActive: !g.isActive }));
}

export const groupsStore = {
	get groups() {
		return genericStore.items;
	},
	getById: genericStore.getById,
	add,
	update: genericStore.update,
	remove: genericStore.remove,
	updateRound,
	markRoundPaid,
	markRoundPending,
	markRoundReceived,
	toggleActive
};
