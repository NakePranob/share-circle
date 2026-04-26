import { useAuth } from '$features/auth/composables/useAuth.svelte';
import {
	fetchGroupsWithRounds,
	fetchRoundsForGroup,
	createGroupWithRounds,
	updateGroupFields,
	removeGroup,
	removeAllGroups
} from '$features/groups/services/groupsService';
import {
	setRoundPaid,
	setRoundPending,
	setRoundReceived,
	setRoundReceivedPending,
	findRoundRowId,
	updateRoundFields
} from '$features/groups/services/roundsService';
import type { Group, Round } from '$features/groups/types';
import type { RoundUpdate } from '$lib/supabase/rounds';
import { toast } from 'svelte-sonner';
import { SvelteDate } from 'svelte/reactivity';

// Module-level singleton state (mirrors useAuth pattern)
let groups = $state<Group[]>([]);
let loading = $state(false);
let isLoaded = $state(false);

export function useGroupsStore() {
	const auth = useAuth();

	return {
		get groups() {
			return groups;
		},
		get loading() {
			return loading;
		},
		get isLoaded() {
			return isLoaded;
		},

		async loadGroups() {
			if (!auth.userId || loading) return;
			loading = true;
			try {
				groups = await fetchGroupsWithRounds(auth.userId);
				isLoaded = true;
			} catch (error) {
				toast.error('Failed to load groups');
				console.error(error);
			} finally {
				loading = false;
			}
		},

		async add(group: Omit<Group, 'id' | 'createdAt'>): Promise<Group> {
			if (!auth.userId) throw new Error('Not authenticated');
			try {
				const newGroup = await createGroupWithRounds(auth.userId, group);
				groups = [...groups, newGroup];
				return newGroup;
			} catch (error) {
				toast.error('Failed to create group');
				throw error;
			}
		},

		async update(id: string, updates: Partial<Group>): Promise<void> {
			try {
				await updateGroupFields(id, updates);
				groups = groups.map((g) => (g.id === id ? { ...g, ...updates } : g));
			} catch (error) {
				toast.error('Failed to update group');
				throw error;
			}
		},

		async remove(id: string): Promise<void> {
			try {
				await removeGroup(id);
				groups = groups.filter((g) => g.id !== id);
			} catch (error) {
				toast.error('Failed to delete group');
				throw error;
			}
		},

		getById(id: string): Group | undefined {
			return groups.find((g) => g.id === id);
		},

		loadGroupWithRounds(id: string): void {
			const group = groups.find((g) => g.id === id);
			if (!group) return;

			fetchRoundsForGroup(id)
				.then((rounds) => {
					groups = groups.map((g) => (g.id === id ? { ...g, rounds } : g));
				})
				.catch((error) => {
					toast.error('Failed to load rounds');
					console.error('Failed to load rounds:', error);
				});
		},

		async loadRoundsForGroup(groupId: string): Promise<Round[]> {
			try {
				return await fetchRoundsForGroup(groupId);
			} catch (error) {
				toast.error('Failed to load rounds');
				throw error;
			}
		},

		async updateRound(
			groupId: string,
			roundNumber: number,
			partial: Partial<Round>
		): Promise<void> {
			const group = groups.find((g) => g.id === groupId);
			if (!group) return;
			const round = group.rounds.find((r) => r.roundNumber === roundNumber);
			if (!round) return;

			try {
				const rowId = await findRoundRowId(groupId, roundNumber);
				const updates: RoundUpdate = {};
				if (partial.date !== undefined) updates.date = partial.date;
				if (partial.paymentAmount !== undefined) updates.payment_amount = partial.paymentAmount;
				if (partial.receiveAmount !== undefined) updates.receive_amount = partial.receiveAmount;
				if (partial.managementFee !== undefined) updates.management_fee = partial.managementFee;

				await updateRoundFields(rowId, updates);

				groups = groups.map((g) => {
					if (g.id !== groupId) return g;
					return {
						...g,
						rounds: g.rounds.map((r) => (r.roundNumber === roundNumber ? { ...r, ...partial } : r))
					};
				});
			} catch (error) {
				toast.error('Failed to update round');
				throw error;
			}
		},

		async markRoundPaid(groupId: string, roundNumber: number): Promise<void> {
			const group = groups.find((g) => g.id === groupId);
			if (!group) return;
			const round = group.rounds.find((r) => r.roundNumber === roundNumber);
			if (!round) return;

			try {
				await setRoundPaid(groupId, roundNumber);
				round.status = 'paid';
				round.paidAt = new SvelteDate().toISOString();
			} catch (error) {
				toast.error('Failed to mark round as paid');
				throw error;
			}
		},

		async markRoundPending(groupId: string, roundNumber: number): Promise<void> {
			const group = groups.find((g) => g.id === groupId);
			if (!group) return;
			const round = group.rounds.find((r) => r.roundNumber === roundNumber);
			if (!round) return;

			try {
				await setRoundPending(groupId, roundNumber);
				round.status = 'pending';
				round.paidAt = undefined;
			} catch (error) {
				toast.error('Failed to mark round as pending');
				throw error;
			}
		},

		async markRoundReceived(groupId: string, roundNumber: number): Promise<void> {
			const group = groups.find((g) => g.id === groupId);
			if (!group) return;
			const round = group.rounds.find((r) => r.roundNumber === roundNumber);
			if (!round) return;

			try {
				await setRoundReceived(groupId, roundNumber);
				round.payoutStatus = 'received';
				round.receivedAt = new SvelteDate().toISOString();
			} catch (error) {
				toast.error('Failed to mark round as received');
				throw error;
			}
		},

		async markRoundReceivedPending(groupId: string, roundNumber: number): Promise<void> {
			const group = groups.find((g) => g.id === groupId);
			if (!group) return;
			const round = group.rounds.find((r) => r.roundNumber === roundNumber);
			if (!round) return;

			try {
				await setRoundReceivedPending(groupId, roundNumber);
				round.payoutStatus = 'pending';
				round.receivedAt = undefined;
			} catch (error) {
				toast.error('Failed to mark round as pending');
				throw error;
			}
		},

		async toggleActive(id: string): Promise<void> {
			const group = groups.find((g) => g.id === id);
			if (!group) return;

			try {
				await updateGroupFields(id, { isActive: !group.isActive });
				group.isActive = !group.isActive;
			} catch (error) {
				toast.error('Failed to toggle group status');
				throw error;
			}
		},

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		async toggleMyRound(_groupId: string, _roundNumber: number): Promise<void> {
			toast.info('Toggle my round not fully implemented yet');
		},

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		async removeMyRound(_groupId: string, _roundNumber: number): Promise<void> {
			toast.info('Remove my round not fully implemented yet');
		},

		clearAll(): void {
			groups = [];
			isLoaded = false;
		},

		async deleteAll(): Promise<void> {
			if (!auth.userId) throw new Error('Not authenticated');
			try {
				await removeAllGroups(auth.userId);
				groups = [];
			} catch (error) {
				toast.error('Failed to delete all groups');
				throw error;
			}
		}
	};
}
