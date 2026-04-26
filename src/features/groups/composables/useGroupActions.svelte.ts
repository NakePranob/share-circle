import { useGroupsStore } from '$features/groups/stores/groups.svelte';
import { useWalletStore } from '$features/wallet/stores/wallet.svelte';
import { toast } from 'svelte-sonner';
import type { Round } from '$features/groups/types';
import { TOAST_MESSAGES } from '$features/groups/constants';
import { TRANSACTION_TYPE } from '$features/wallet/types';

export function useGroupActions() {
	const groupsStore = useGroupsStore();
	const walletStore = useWalletStore();

	async function markAsPaid(groupId: string, roundNumber: number) {
		const round = groupsStore.getById(groupId)?.rounds.find((r) => r.roundNumber === roundNumber);
		await groupsStore.markRoundPaid(groupId, roundNumber);
		if (round) {
			await walletStore.adjustBalance(-round.paymentAmount);
			await walletStore.addTransaction(
				TRANSACTION_TYPE.PAYMENT,
				round.paymentAmount,
				'',
				groupId,
				roundNumber
			);
		}
		toast.success(TOAST_MESSAGES.PAID);
	}

	async function markAsPending(groupId: string, roundNumber: number) {
		const round = groupsStore.getById(groupId)?.rounds.find((r) => r.roundNumber === roundNumber);
		await groupsStore.markRoundPending(groupId, roundNumber);
		if (round) {
			await walletStore.adjustBalance(+round.paymentAmount);
			const paymentTxn = walletStore.wallet.transactions.find(
				(t) => t.groupId === groupId && t.roundNumber === roundNumber && t.type === 'payment'
			);
			if (paymentTxn) await walletStore.removeTransaction(paymentTxn.id);
		}
		toast.success(TOAST_MESSAGES.STATUS_CHANGED);
	}

	async function markAsReceived(groupId: string, roundNumber: number) {
		const round = groupsStore.getById(groupId)?.rounds.find((r) => r.roundNumber === roundNumber);
		await groupsStore.markRoundReceived(groupId, roundNumber);
		if (round) {
			const net = round.receiveAmount - (round.managementFee ?? 0);
			await walletStore.adjustBalance(+net);
			await walletStore.addTransaction(TRANSACTION_TYPE.PAYOUT, net, '', groupId, roundNumber);
		}
		toast.success(TOAST_MESSAGES.PAID);
	}

	async function markReceivedPending(groupId: string, roundNumber: number) {
		const round = groupsStore.getById(groupId)?.rounds.find((r) => r.roundNumber === roundNumber);
		await groupsStore.markRoundReceivedPending(groupId, roundNumber);
		if (round) {
			const net = round.receiveAmount - (round.managementFee ?? 0);
			await walletStore.adjustBalance(-net);
			const payoutTxn = walletStore.wallet.transactions.find(
				(t) => t.groupId === groupId && t.roundNumber === roundNumber && t.type === 'payout'
			);
			if (payoutTxn) await walletStore.removeTransaction(payoutTxn.id);
		}
		toast.success(TOAST_MESSAGES.STATUS_CHANGED);
	}

	async function deleteGroup(id: string) {
		await groupsStore.remove(id);
		toast.success(TOAST_MESSAGES.GROUP_DELETED);
	}

	async function toggleActive(id: string) {
		const group = groupsStore.getById(id);
		await groupsStore.toggleActive(id);
		toast.success(group?.isActive ? 'ปิดวงแล้ว' : 'เปิดวงอีกครั้ง');
	}

	async function updateRound(groupId: string, roundNumber: number, partial: Partial<Round>) {
		await groupsStore.updateRound(groupId, roundNumber, partial);
		toast.success(TOAST_MESSAGES.SAVED);
	}

	return {
		markAsPaid,
		markAsPending,
		markAsReceived,
		markReceivedPending,
		deleteGroup,
		toggleActive,
		updateRound
	};
}
