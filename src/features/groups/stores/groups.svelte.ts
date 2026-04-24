import { useAuth } from '$features/auth/composables/useAuth.svelte';
import { getGroups, createGroup, updateGroup, deleteGroup, deleteAllGroups } from '$lib/supabase/groups';
import {
	getRounds,
	getRoundsByUserId,
	createRounds,
	updateRound as updateRoundInSupabase,
	updateRoundStatus,
	updatePayoutStatus,
	type RoundUpdate
} from '$lib/supabase/rounds';
import { ROUND_STATUS, PAYOUT_STATUS } from '$features/groups/types';
import type { Group, Round, RoundStatus, PayoutStatus } from '$features/groups/types';
import { toast } from 'svelte-sonner';
import { SvelteDate } from 'svelte/reactivity';

class GroupsStore {
	#auth = useAuth();
	#groups = $state<Group[]>([]);
	#loading = $state(false);
	#isLoaded = $state(false);

	get groups() {
		return this.#groups;
	}

	get loading() {
		return this.#loading;
	}

	get isLoaded() {
		return this.#isLoaded;
	}

	async loadGroups() {
		if (!this.#auth.userId || this.#loading) return;
		this.#loading = true;
		try {
			const data = await getGroups(this.#auth.userId);

			const roundsData = await getRoundsByUserId(this.#auth.userId);

			const roundsByGroupId: Record<string, Round[]> = {};
			roundsData.forEach((r) => {
				const round: Round = {
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

				if (!roundsByGroupId[r.group_id]) {
					roundsByGroupId[r.group_id] = [];
				}
				roundsByGroupId[r.group_id].push(round);
			});

			this.#groups = data.map((g) => ({
				id: g.id,
				name: g.name,
				rounds: roundsByGroupId[g.id] || [],
				createdAt: g.created_at ?? '',
				isActive: g.is_active ?? true,
				managementFeePerRound: undefined
			}));

			this.#isLoaded = true;
		} catch (error) {
			toast.error('Failed to load groups');
			console.error(error);
		} finally {
			this.#loading = false;
		}
	}

	async add(group: Omit<Group, 'id' | 'createdAt'>): Promise<Group> {
		if (!this.#auth.userId) throw new Error('Not authenticated');
		try {
			const data = await createGroup({
				user_id: this.#auth.userId,
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

			const newGroup: Group = {
				id: data.id,
				name: data.name,
				rounds: group.rounds || [],
				createdAt: data.created_at ?? '',
				isActive: data.is_active ?? true
			};
			this.#groups = [...this.#groups, newGroup];
			return newGroup;
		} catch (error) {
			toast.error('Failed to create group');
			throw error;
		}
	}

	async update(id: string, updates: Partial<Group>): Promise<void> {
		try {
			await updateGroup(id, {
				name: updates.name,
				is_active: updates.isActive
			});
			this.#groups = this.#groups.map((g) => (g.id === id ? { ...g, ...updates } : g));
		} catch (error) {
			toast.error('Failed to update group');
			throw error;
		}
	}

	async remove(id: string): Promise<void> {
		try {
			await deleteGroup(id);
			this.#groups = this.#groups.filter((g) => g.id !== id);
		} catch (error) {
			toast.error('Failed to delete group');
			throw error;
		}
	}

	getById(id: string): Group | undefined {
		return this.#groups.find((g) => g.id === id);
	}

	loadGroupWithRounds(id: string): void {
		const group = this.#groups.find((g) => g.id === id);
		if (!group) return;

		this.loadRoundsForGroup(id)
			.then((rounds) => {
				this.#groups = this.#groups.map((g) => (g.id === id ? { ...g, rounds } : g));
			})
			.catch((error) => {
				toast.error('Failed to load rounds');
				console.error('Failed to load rounds:', error);
			});
	}

	async loadRoundsForGroup(groupId: string): Promise<Round[]> {
		try {
			const data = await getRounds(groupId);
			return data.map((r) => ({
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
			}));
		} catch (error) {
			toast.error('Failed to load rounds');
			throw error;
		}
	}

	async updateRound(groupId: string, roundNumber: number, partial: Partial<Round>): Promise<void> {
		const group = this.#groups.find((g) => g.id === groupId);
		if (!group) return;

		const round = group.rounds.find((r) => r.roundNumber === roundNumber);
		if (!round) return;

		try {
			const rounds = await getRounds(groupId);
			const supabaseRound = rounds.find((r) => r.round_number === roundNumber);
			if (!supabaseRound) return;

			const updates: RoundUpdate = {};
			if (partial.date !== undefined) updates.date = partial.date;
			if (partial.paymentAmount !== undefined) updates.payment_amount = partial.paymentAmount;
			if (partial.receiveAmount !== undefined) updates.receive_amount = partial.receiveAmount;
			if (partial.managementFee !== undefined) updates.management_fee = partial.managementFee;

			await updateRoundInSupabase(supabaseRound.id, updates);

			this.#groups = this.#groups.map((g) => {
				if (g.id === groupId) {
					return {
						...g,
						rounds: g.rounds.map((r) => {
							if (r.roundNumber === roundNumber) {
								return { ...r, ...partial };
							}
							return r;
						})
					};
				}
				return g;
			});
		} catch (error) {
			toast.error('Failed to update round');
			throw error;
		}
	}

	async markRoundPaid(groupId: string, roundNumber: number): Promise<void> {
		const group = this.#groups.find((g) => g.id === groupId);
		if (!group) return;

		const round = group.rounds.find((r) => r.roundNumber === roundNumber);
		if (!round) return;

		try {
			const rounds = await getRounds(groupId);
			const supabaseRound = rounds.find((r) => r.round_number === roundNumber);
			if (!supabaseRound) return;

			await updateRoundStatus(supabaseRound.id, 'paid');
			round.status = 'paid';
			round.paidAt = new SvelteDate().toISOString();
		} catch (error) {
			toast.error('Failed to mark round as paid');
			throw error;
		}
	}

	async markRoundPending(groupId: string, roundNumber: number): Promise<void> {
		const group = this.#groups.find((g) => g.id === groupId);
		if (!group) return;

		const round = group.rounds.find((r) => r.roundNumber === roundNumber);
		if (!round) return;

		try {
			const rounds = await getRounds(groupId);
			const supabaseRound = rounds.find((r) => r.round_number === roundNumber);
			if (!supabaseRound) return;

			await updateRoundStatus(supabaseRound.id, 'pending');
			round.status = 'pending';
			round.paidAt = undefined;
		} catch (error) {
			toast.error('Failed to mark round as pending');
			throw error;
		}
	}

	async markRoundReceived(groupId: string, roundNumber: number): Promise<void> {
		const group = this.#groups.find((g) => g.id === groupId);
		if (!group) return;

		const round = group.rounds.find((r) => r.roundNumber === roundNumber);
		if (!round) return;

		try {
			const rounds = await getRounds(groupId);
			const supabaseRound = rounds.find((r) => r.round_number === roundNumber);
			if (!supabaseRound) return;

			await updatePayoutStatus(supabaseRound.id, 'received');
			round.payoutStatus = 'received';
			round.receivedAt = new SvelteDate().toISOString();
		} catch (error) {
			toast.error('Failed to mark round as received');
			throw error;
		}
	}

	async markRoundReceivedPending(groupId: string, roundNumber: number): Promise<void> {
		const group = this.#groups.find((g) => g.id === groupId);
		if (!group) return;

		const round = group.rounds.find((r) => r.roundNumber === roundNumber);
		if (!round) return;

		try {
			const rounds = await getRounds(groupId);
			const supabaseRound = rounds.find((r) => r.round_number === roundNumber);
			if (!supabaseRound) return;

			await updatePayoutStatus(supabaseRound.id, 'pending');
			round.payoutStatus = 'pending';
			round.receivedAt = undefined;
		} catch (error) {
			toast.error('Failed to mark round as pending');
			throw error;
		}
	}

	async toggleActive(id: string): Promise<void> {
		const group = this.#groups.find((g) => g.id === id);
		if (!group) return;

		try {
			await updateGroup(id, { is_active: !group.isActive });
			group.isActive = !group.isActive;
		} catch (error) {
			toast.error('Failed to toggle group status');
			throw error;
		}
	}

	async toggleMyRound(_groupId: string, _roundNumber: number): Promise<void> {
		toast.info('Toggle my round not fully implemented yet');
	}

	async removeMyRound(_groupId: string, _roundNumber: number): Promise<void> {
		toast.info('Remove my round not fully implemented yet');
	}

	clearAll(): void {
		this.#groups = [];
	}

	async deleteAll(): Promise<void> {
		if (!this.#auth.userId) throw new Error('Not authenticated');
		try {
			await deleteAllGroups(this.#auth.userId);
			this.#groups = [];
		} catch (error) {
			toast.error('Failed to delete all groups');
			throw error;
		}
	}
}

// Singleton instance
let groupsStoreInstance: GroupsStore | null = null;

export function useGroupsStore(): GroupsStore {
	if (!groupsStoreInstance) {
		groupsStoreInstance = new GroupsStore();
	}
	return groupsStoreInstance;
}
