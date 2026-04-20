import { groupsStore } from '$features/groups/stores/groups.svelte';
import { toast } from 'svelte-sonner';
import type { Round } from '$features/shared/types';

export function useGroupActions() {
	function markAsPaid(groupId: string, roundNumber: number) {
		groupsStore.markRoundPaid(groupId, roundNumber);
		toast.success('จ่ายเงินเรียบร้อย');
	}

	function markAsPending(groupId: string, roundNumber: number) {
		groupsStore.markRoundPending(groupId, roundNumber);
		toast.success('เปลี่ยนสถานะเรียบร้อย');
	}

	function deleteGroup(id: string) {
		groupsStore.remove(id);
		toast.success('ลบวงแชร์เรียบร้อย');
	}

	function toggleActive(id: string) {
		groupsStore.toggleActive(id);
	}

	function updateRound(groupId: string, roundNumber: number, partial: Partial<Round>) {
		groupsStore.updateRound(groupId, roundNumber, partial);
		toast.success('บันทึกเรียบร้อย');
	}

	return {
		markAsPaid,
		markAsPending,
		deleteGroup,
		toggleActive,
		updateRound
	};
}
