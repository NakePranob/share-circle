import { groupsStore } from '$features/groups/stores/groups.svelte';
import { walletStore } from '$features/wallet/stores/wallet.svelte';
import { paidTransactions } from '$lib/utils/cashflow';
import type { Transaction } from '$features/wallet/types';

interface TransactionEntry {
	transaction: Transaction;
	groupName?: string;
}

export function useAuditLog() {
	return {
		get manualTransactions(): TransactionEntry[] {
			return walletStore.wallet.manualTransactions
				.map((t) => ({ transaction: t, groupName: undefined }))
				.sort((a, b) => b.transaction.date.localeCompare(a.transaction.date));
		},
		get groupTransactions(): TransactionEntry[] {
			const groups = groupsStore.groups;
			const groupMap = new Map(groups.map((g) => [g.id, g.name]));
			return paidTransactions(groups)
				.map((t) => ({
					transaction: t,
					groupName: t.groupId ? groupMap.get(t.groupId) : undefined
				}))
				.sort((a, b) => b.transaction.date.localeCompare(a.transaction.date));
		},
		get allTransactions(): TransactionEntry[] {
			const manual = walletStore.wallet.manualTransactions
				.map((t) => ({ transaction: t, groupName: undefined }))
				.sort((a, b) => b.transaction.date.localeCompare(a.transaction.date));
			
			const groups = groupsStore.groups;
			const groupMap = new Map(groups.map((g) => [g.id, g.name]));
			const group = paidTransactions(groups)
				.map((t) => ({
					transaction: t,
					groupName: t.groupId ? groupMap.get(t.groupId) : undefined
				}))
				.sort((a, b) => b.transaction.date.localeCompare(a.transaction.date));
			
			return [...manual, ...group].sort(
				(a, b) => b.transaction.date.localeCompare(a.transaction.date)
			);
		}
	};
}
