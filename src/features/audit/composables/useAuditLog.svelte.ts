import { useWalletStore } from '$features/wallet/stores/wallet.svelte';
import { useGroupsStore } from '$features/groups/stores/groups.svelte';
import { SvelteMap } from 'svelte/reactivity';
import type { Transaction } from '$features/wallet/types';

interface TransactionEntry {
	transaction: Transaction;
	groupName?: string;
}

function sortKey(entry: TransactionEntry): string {
	return entry.transaction.actionAt ?? entry.transaction.date;
}

export function useAuditLog() {
	const walletStore = useWalletStore();
	const groupsStore = useGroupsStore();

	const wallet = $derived(walletStore.wallet);
	const groupMap = $derived(
		new SvelteMap(groupsStore.groups.map((g: { id: string; name: string }) => [g.id, g.name]))
	);

	const allTransactions = $derived(
		wallet.manualTransactions
			.map((t: Transaction) => ({
				transaction: t,
				groupName: t.groupId ? (groupMap.get(t.groupId) as string | undefined) : undefined
			}))
			.sort((a: TransactionEntry, b: TransactionEntry) => sortKey(b).localeCompare(sortKey(a)))
	);

	const manualTransactions = $derived(
		allTransactions.filter((e) => e.transaction.groupId === null)
	);

	const groupTransactions = $derived(
		allTransactions.filter((e) => e.transaction.groupId !== null)
	);

	return {
		get allTransactions() {
			return allTransactions;
		},
		get manualTransactions() {
			return manualTransactions;
		},
		get groupTransactions() {
			return groupTransactions;
		}
	};
}
