import { SvelteMap } from 'svelte/reactivity';
import { groupsStore } from '$features/groups/stores/groups.svelte';
import { walletStore } from '$features/wallet/stores/wallet.svelte';
import { paidTransactions } from '$lib/utils/cashflow';
import type { Transaction } from '$features/wallet/types';

/**
 * Composable สำหรับจัดการ audit log
 * แก้ pattern ให้สม่ำเสมอกับ composables อื่นๆ
 */
interface TransactionEntry {
	transaction: Transaction;
	groupName?: string;
}

function sortKey(entry: TransactionEntry): string {
	return entry.transaction.actionAt ?? entry.transaction.date;
}

export function useAuditLog() {
	const groups = $derived(groupsStore.groups);
	const wallet = $derived(walletStore.wallet);
	const groupMap = $derived(new SvelteMap(groups.map((g) => [g.id, g.name])));

	const manualTransactions = $derived(
		wallet.manualTransactions
			.map((t) => ({ transaction: t, groupName: undefined }))
			.sort((a, b) => sortKey(b).localeCompare(sortKey(a)))
	);

	const groupTransactions = $derived(
		paidTransactions(groups)
			.map((t) => ({
				transaction: t,
				groupName: t.groupId ? groupMap.get(t.groupId) : undefined
			}))
			.sort((a, b) => sortKey(b).localeCompare(sortKey(a)))
	);

	const allTransactions = $derived(
		[...manualTransactions, ...groupTransactions].sort((a, b) => sortKey(b).localeCompare(sortKey(a)))
	);

	return {
		manualTransactions,
		groupTransactions,
		allTransactions
	};
}
