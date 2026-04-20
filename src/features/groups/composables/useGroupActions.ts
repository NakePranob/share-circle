import { groupsStore } from '$features/groups/stores/groups.svelte';
import { toast } from 'svelte-sonner';
import type { Round } from '$features/groups/types';
import { TOAST_MESSAGES } from '$features/groups/constants';

export function useGroupActions() {
	function markAsPaid(groupId: string, roundNumber: number) {
		groupsStore.markRoundPaid(groupId, roundNumber);
		toast.success(TOAST_MESSAGES.PAID);
	}

	function markAsPending(groupId: string, roundNumber: number) {
		groupsStore.markRoundPending(groupId, roundNumber);
		toast.success(TOAST_MESSAGES.STATUS_CHANGED);
	}

	function deleteGroup(id: string) {
		groupsStore.remove(id);
		toast.success(TOAST_MESSAGES.GROUP_DELETED);
	}

	function toggleActive(id: string) {
		groupsStore.toggleActive(id);
	}

	function updateRound(groupId: string, roundNumber: number, partial: Partial<Round>) {
		groupsStore.updateRound(groupId, roundNumber, partial);
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
