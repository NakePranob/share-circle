import { useAuth } from '$features/auth/composables/useAuth.svelte';
import { getGroups, createGroup, updateGroup, deleteGroup, deleteAllGroups } from '$lib/supabase/groups';
import {
	getRounds,
	getRoundsByUserId,
	createRound,
	createRounds,
	updateRound as updateRoundInSupabase,
	updateRoundStatus,
	updatePayoutStatus,
	type RoundUpdate
} from '$lib/supabase/rounds';
import type { Group, Round } from '$features/groups/types';
import { toast } from 'svelte-sonner';
import { SvelteDate } from 'svelte/reactivity';

// Module-level state (shared across all instances)
let groups = $state<Group[]>([]);
let loading = $state(false);
let isLoaded = $state(false);

export function useGroupsStore() {
	const auth = useAuth();

	async function loadGroups() {
		if (!auth.userId || loading) return;
		loading = true;
		try {
			const data = await getGroups(auth.userId);

			// Load all rounds for the user
			const roundsData = await getRoundsByUserId(auth.userId);

			// Group rounds by group_id using object
			const roundsByGroupId: Record<string, Round[]> = {};
			roundsData.forEach((r) => {
				const round: Round = {
					roundNumber: r.round_number,
					date: r.date,
					paymentAmount: r.payment_amount,
					receiveAmount: r.receive_amount,
					status: (r.status ?? 'pending') as 'pending' | 'paid',
					paidAt: r.paid_at ?? undefined,
					payoutStatus: (r.payout_status ?? 'pending') as 'pending' | 'received',
					receivedAt: r.received_at ?? undefined,
					isMyRound: r.is_my_round ?? false,
					managementFee: r.management_fee ?? 0
				};

				if (!roundsByGroupId[r.group_id]) {
					roundsByGroupId[r.group_id] = [];
				}
				roundsByGroupId[r.group_id].push(round);
			});

			// Transform Supabase data to app format with rounds
			groups = data.map((g) => ({
				id: g.id,
				name: g.name,
				rounds: roundsByGroupId[g.id] || [],
				createdAt: g.created_at ?? '',
				isActive: g.is_active ?? true,
				managementFeePerRound: undefined
			}));

			isLoaded = true;
		} catch (error) {
			toast.error('Failed to load groups');
			console.error(error);
		} finally {
			loading = false;
		}
	}

	async function add(group: Omit<Group, 'id' | 'createdAt'>): Promise<Group> {
		if (!auth.userId) throw new Error('Not authenticated');
		try {
			const data = await createGroup({
				user_id: auth.userId,
				name: group.name,
				is_active: group.isActive ?? true
			});

			// Create rounds if provided
			if (group.rounds && group.rounds.length > 0) {
				const roundsToInsert = group.rounds.map((round) => ({
					group_id: data.id,
					round_number: round.roundNumber,
					date: round.date,
					payment_amount: round.paymentAmount,
					receive_amount: round.receiveAmount,
					status: round.status ?? 'pending',
					paid_at: round.paidAt ?? null,
					payout_status: round.payoutStatus ?? 'pending',
					received_at: round.receivedAt ?? null,
					is_my_round: round.isMyRound ?? false,
					management_fee: round.managementFee ?? 0
				}));
				await createRounds(roundsToInsert);
			}

			const newGroup: Group = {
				id: data.id,
				name: data.name,
				rounds: group.rounds || [],
				createdAt: data.created_at ?? '',
				isActive: data.is_active ?? true
			};
			groups = [...groups, newGroup];
			return newGroup;
		} catch (error) {
			toast.error('Failed to create group');
			throw error;
		}
	}

	async function update(id: string, updates: Partial<Group>): Promise<void> {
		try {
			await updateGroup(id, {
				name: updates.name,
				is_active: updates.isActive
			});
			groups = groups.map((g) => (g.id === id ? { ...g, ...updates } : g));
		} catch (error) {
			toast.error('Failed to update group');
			throw error;
		}
	}

	async function remove(id: string): Promise<void> {
		try {
			await deleteGroup(id);
			groups = groups.filter((g) => g.id !== id);
		} catch (error) {
			toast.error('Failed to delete group');
			throw error;
		}
	}

	function getById(id: string): Group | undefined {
		return groups.find((g) => g.id === id);
	}

	function loadGroupWithRounds(id: string): void {
		const group = groups.find((g) => g.id === id);
		if (!group) return;

		// Always load rounds to ensure data is fresh
		loadRoundsForGroup(id)
			.then((rounds) => {
				// Update the group in the array with rounds
				groups = groups.map((g) => (g.id === id ? { ...g, rounds } : g));
			})
			.catch((error) => {
				toast.error('Failed to load rounds');
				console.error('Failed to load rounds:', error);
			});
	}

	async function loadRoundsForGroup(groupId: string): Promise<Round[]> {
		try {
			const data = await getRounds(groupId);
			return data.map((r) => ({
				roundNumber: r.round_number,
				date: r.date,
				paymentAmount: r.payment_amount,
				receiveAmount: r.receive_amount,
				status: (r.status ?? 'pending') as 'pending' | 'paid',
				paidAt: r.paid_at ?? undefined,
				payoutStatus: (r.payout_status ?? 'pending') as 'pending' | 'received',
				receivedAt: r.received_at ?? undefined,
				isMyRound: r.is_my_round ?? false,
				managementFee: r.management_fee ?? 0
			}));
		} catch (error) {
			toast.error('Failed to load rounds');
			throw error;
		}
	}

	async function updateRound(
		groupId: string,
		roundNumber: number,
		partial: Partial<Round>
	): Promise<void> {
		const group = groups.find((g) => g.id === groupId);
		if (!group) return;

		const round = group.rounds.find((r) => r.roundNumber === roundNumber);
		if (!round) return;

		try {
			// Find the actual round ID from Supabase
			const rounds = await getRounds(groupId);
			const supabaseRound = rounds.find((r) => r.round_number === roundNumber);
			if (!supabaseRound) return;

			// Update in Supabase
			const updates: RoundUpdate = {};
			if (partial.date !== undefined) updates.date = partial.date;
			if (partial.paymentAmount !== undefined) updates.payment_amount = partial.paymentAmount;
			if (partial.receiveAmount !== undefined) updates.receive_amount = partial.receiveAmount;
			if (partial.managementFee !== undefined) updates.management_fee = partial.managementFee;

			await updateRoundInSupabase(supabaseRound.id, updates);

			// Update local state
			groups = groups.map((g) => {
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

	async function markRoundPaid(groupId: string, roundNumber: number): Promise<void> {
		// Find the round in the group
		const group = groups.find((g) => g.id === groupId);
		if (!group) return;

		const round = group.rounds.find((r) => r.roundNumber === roundNumber);
		if (!round) return;

		try {
			// Need to find the actual round ID from Supabase
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

	async function markRoundPending(groupId: string, roundNumber: number): Promise<void> {
		const group = groups.find((g) => g.id === groupId);
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

	async function markRoundReceived(groupId: string, roundNumber: number): Promise<void> {
		const group = groups.find((g) => g.id === groupId);
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

	async function markRoundReceivedPending(groupId: string, roundNumber: number): Promise<void> {
		const group = groups.find((g) => g.id === groupId);
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

	async function toggleActive(id: string): Promise<void> {
		const group = groups.find((g) => g.id === id);
		if (!group) return;

		try {
			await updateGroup(id, { is_active: !group.isActive });
			group.isActive = !group.isActive;
		} catch (error) {
			toast.error('Failed to toggle group status');
			throw error;
		}
	}

	async function toggleMyRound(_groupId: string, _roundNumber: number): Promise<void> {
		// This requires updating the round in Supabase
		toast.info('Toggle my round not fully implemented yet');
	}

	async function removeMyRound(_groupId: string, _roundNumber: number): Promise<void> {
		// This requires updating the round in Supabase
		toast.info('Remove my round not fully implemented yet');
	}

	function clearAll(): void {
		groups = [];
	}

	async function deleteAll(): Promise<void> {
		if (!auth.userId) throw new Error('Not authenticated');
		try {
			await deleteAllGroups(auth.userId);
			groups = [];
		} catch (error) {
			toast.error('Failed to delete all groups');
			throw error;
		}
	}

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
		loadGroups,
		getById,
		loadGroupWithRounds,
		add,
		update,
		remove,
		clearAll,
		deleteAll,
		loadRoundsForGroup,
		updateRound,
		markRoundPaid,
		markRoundPending,
		markRoundReceived,
		markRoundReceivedPending,
		toggleActive,
		toggleMyRound,
		removeMyRound
	};
}
