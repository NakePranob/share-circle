import { useGroupsStore } from '$features/groups/stores/groups.svelte';
import { toast } from 'svelte-sonner';
import type { Round } from '$features/groups/types';
import { TOAST_MESSAGES } from '$features/groups/constants';

const groupsStore = useGroupsStore();

export function useGroupActions() {
	async function markAsPaid(groupId: string, roundNumber: number) {
		await groupsStore.markRoundPaid(groupId, roundNumber);
		toast.success(TOAST_MESSAGES.PAID);
	}

	async function markAsPending(groupId: string, roundNumber: number) {
		await groupsStore.markRoundPending(groupId, roundNumber);
		toast.success(TOAST_MESSAGES.STATUS_CHANGED);
	}

	async function deleteGroup(id: string) {
		await groupsStore.remove(id);
		toast.success(TOAST_MESSAGES.GROUP_DELETED);
	}

	async function toggleActive(id: string) {
		await groupsStore.toggleActive(id);
	}

	async function updateRound(groupId: string, roundNumber: number, partial: Partial<Round>) {
		await groupsStore.updateRound(groupId, roundNumber, partial);
		toast.success(TOAST_MESSAGES.SAVED);
	}

	return {
		markAsPaid,
		markAsPending,
		deleteGroup,
		toggleActive,
		updateRound
	};
}
