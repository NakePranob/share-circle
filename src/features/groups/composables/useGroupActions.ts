import { useGroupsStore } from '$features/groups/stores/groups.svelte';
import { useWalletStore } from '$features/wallet/stores/wallet.svelte';
import { toast } from 'svelte-sonner';
import type { Round } from '$features/groups/types';
import { TOAST_MESSAGES } from '$features/groups/constants';
import { TRANSACTION_TYPE } from '$features/wallet/types';

const groupsStore = useGroupsStore();
const walletStore = useWalletStore();

export function useGroupActions() {
	async function markAsPaid(groupId: string, roundNumber: number) {
		const round = groupsStore.getById(groupId)?.rounds.find((r) => r.roundNumber === roundNumber);
		await groupsStore.markRoundPaid(groupId, roundNumber);
		if (round) {
			await walletStore.adjustBalance(-round.paymentAmount);
			await walletStore.addTransaction(TRANSACTION_TYPE.PAYMENT, round.paymentAmount, '', groupId, roundNumber);
		}
		toast.success(TOAST_MESSAGES.PAID);
	}

	async function markAsPending(groupId: string, roundNumber: number) {
		const round = groupsStore.getById(groupId)?.rounds.find((r) => r.roundNumber === roundNumber);
		await groupsStore.markRoundPending(groupId, roundNumber);
		if (round) {
			await walletStore.adjustBalance(+round.paymentAmount);
		}
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
