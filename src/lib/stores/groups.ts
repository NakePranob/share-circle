import { persistedState } from './persisted.svelte';
import type { Group, Round } from '$lib/types';

const _store = persistedState<Group[]>('share-circle-groups', []);

function getAll(): Group[] {
	// Migrate old groups to have default values for new fields
	return _store.value.map((g) => ({
		...g,
		playMode: g.playMode ?? 'fixed',
		fixedPayPerRound: g.fixedPayPerRound ?? undefined,
		steppedPayments: g.steppedPayments ?? undefined,
		receiveAmount: g.receiveAmount ?? g.rounds.find((r) => r.isMyRound)?.amount ?? 0
	}));
}

function getById(id: string): Group | undefined {
	return _store.value.find((g) => g.id === id);
}

function add(group: Omit<Group, 'id' | 'createdAt'>): Group {
	const full: Group = {
		...group,
		id: crypto.randomUUID(),
		createdAt: new Date().toISOString()
	};
	_store.value = [..._store.value, full];
	return full;
}

function update(id: string, updater: (g: Group) => Group): void {
	_store.value = _store.value.map((g) => (g.id !== id ? g : updater(g)));
}

function remove(id: string): void {
	_store.value = _store.value.filter((g) => g.id !== id);
}

function updateRound(groupId: string, roundNumber: number, partial: Partial<Round>): void {
	update(groupId, (g) => ({
		...g,
		rounds: g.rounds.map((r) => (r.roundNumber === roundNumber ? { ...r, ...partial } : r))
	}));
}

function markRoundPaid(groupId: string, roundNumber: number): void {
	updateRound(groupId, roundNumber, { status: 'paid' });
}

function markRoundPending(groupId: string, roundNumber: number): void {
	updateRound(groupId, roundNumber, { status: 'pending' });
}

function toggleActive(id: string): void {
	update(id, (g) => ({ ...g, isActive: !g.isActive }));
}

export const groupsStore = {
	get groups() {
		return getAll();
	},
	getById,
	add,
	update,
	remove,
	updateRound,
	markRoundPaid,
	markRoundPending,
	toggleActive
};
