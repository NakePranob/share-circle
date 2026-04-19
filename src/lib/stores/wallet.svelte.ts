import { persistedState } from './persisted.svelte';
import type { Wallet, Transaction, TransactionType } from '$lib/types';

const _store = persistedState<Wallet>('share-circle-wallet', {
	initialBalance: 0,
	manualTransactions: []
});

function setInitialBalance(amount: number): void {
	_store.value = { ..._store.value, initialBalance: amount };
}

function addTransaction(type: TransactionType, amount: number, note = ''): void {
	const txn: Transaction = {
		id: crypto.randomUUID(),
		groupId: null,
		roundNumber: null,
		date: new Date().toISOString().split('T')[0],
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

export const walletStore = {
	get wallet() {
		return _store.value;
	},
	setInitialBalance,
	addTransaction,
	removeTransaction
};
