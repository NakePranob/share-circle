import { createGenericStore } from '$lib/stores/genericStore.svelte';
import type { Group, Round } from '$features/groups/types';

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
	updateRound(groupId, roundNumber, { status: 'paid', paidAt: new Date().toISOString() });
}

function markRoundReceived(groupId: string, roundNumber: number): void {
	updateRound(groupId, roundNumber, { payoutStatus: 'received', receivedAt: new Date().toISOString() });
}

function markRoundPending(groupId: string, roundNumber: number): void {
	updateRound(groupId, roundNumber, { status: 'pending', paidAt: undefined });
}

function markRoundReceivedPending(groupId: string, roundNumber: number): void {
	updateRound(groupId, roundNumber, { payoutStatus: 'pending', receivedAt: undefined });
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
	clearAll: genericStore.clearAll,
	updateRound,
	markRoundPaid,
	markRoundPending,
	markRoundReceived,
	markRoundReceivedPending,
	toggleActive
};
