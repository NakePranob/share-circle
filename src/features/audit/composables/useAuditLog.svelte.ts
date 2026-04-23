import { SvelteMap } from 'svelte/reactivity';
import { useGroupsStore } from '$features/groups/stores/groups.svelte';
import { useWalletStore } from '$features/wallet/stores/wallet.svelte';
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
	const groupsStore = useGroupsStore();
	const walletStore = useWalletStore();

	const wallet = $derived(walletStore.wallet);
	const groupMap = $derived(new SvelteMap(groupsStore.groups.map((g: { id: string; name: string }) => [g.id, g.name])));

	const manualTransactions = $derived(
		wallet.manualTransactions
			.map((t: Transaction) => ({ transaction: t, groupName: undefined as string | undefined }))
			.sort((a: TransactionEntry, b: TransactionEntry) => sortKey(b).localeCompare(sortKey(a)))
	);

	const groupTransactions = $derived(
		paidTransactions(groupsStore.groups)
			.map((t) => ({
				transaction: t,
				groupName: t.groupId ? (groupMap.get(t.groupId) as string | undefined) : undefined
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
