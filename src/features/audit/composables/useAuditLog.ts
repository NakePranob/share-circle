import { groupsStore } from '$features/groups/stores/groups.svelte';
import { walletStore } from '$features/wallet/stores/wallet.svelte';
import { paidTransactions } from '$lib/utils/cashflow';
import type { Transaction } from '$features/wallet/types';

interface TransactionEntry {
	transaction: Transaction;
	groupName?: string;
}

function sortKey(entry: TransactionEntry): string {
	return entry.transaction.actionAt ?? entry.transaction.date;
}

export function useAuditLog() {
	return {
		get manualTransactions(): TransactionEntry[] {
			return walletStore.wallet.manualTransactions
				.map((t) => ({ transaction: t, groupName: undefined }))
				.sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
		},
		get groupTransactions(): TransactionEntry[] {
			const groups = groupsStore.groups;
			const groupMap = new Map(groups.map((g) => [g.id, g.name]));
			return paidTransactions(groups)
				.map((t) => ({
					transaction: t,
					groupName: t.groupId ? groupMap.get(t.groupId) : undefined
				}))
				.sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
		},
		get allTransactions(): TransactionEntry[] {
			const groups = groupsStore.groups;
			const groupMap = new Map(groups.map((g) => [g.id, g.name]));
			const manual = walletStore.wallet.manualTransactions.map((t) => ({ transaction: t, groupName: undefined }));
			const group = paidTransactions(groups).map((t) => ({
				transaction: t,
				groupName: t.groupId ? groupMap.get(t.groupId) : undefined
			}));
			return [...manual, ...group].sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
		}
	};
}
