import { persistedState } from '$lib/stores/persisted.svelte';
import type { Wallet, Transaction, TransactionType } from '$features/wallet/types';
import { toISODate } from '$features/shared/utils/dateHelpers';

const _store = persistedState<Wallet>('share-circle-wallet', {
	initialBalance: 0,
	manualTransactions: []
});

function setInitialBalance(amount: number): void {
	_store.value = { ..._store.value, initialBalance: amount };
}

function addTransaction(type: TransactionType, amount: number, note = '', groupId: string | null = null, roundNumber: number | null = null): void {
	const txn: Transaction = {
		id: crypto.randomUUID(),
		groupId,
		roundNumber,
		date: toISODate(new Date()),
		type,
		amount,
		isEstimate: false,
		note
	};
	_store.value = {
		..._store.value,
		manualTransactions: [..._store.value.manualTransactions, txn]
	};
}

function removeTransaction(id: string): void {
	_store.value = {
		..._store.value,
		manualTransactions: _store.value.manualTransactions.filter((t) => t.id !== id)
	};
}

function clearAll(): void {
	_store.value = {
		initialBalance: 0,
		manualTransactions: []
	};
}

export const walletStore = {
	get wallet() {
		return _store.value;
	},
	setInitialBalance,
	addTransaction,
	removeTransaction,
	clearAll
};
