import { useAuth } from '$features/auth/composables/useAuth.svelte';
import {
	fetchWallet,
	updateInitialBalance,
	adjustBalanceBatch as adjustBalanceBatchService,
	addTransactionRecord,
	addTransactionRecordBatch,
	removeTransactionRecord,
	resetWallet,
	deleteWalletAndTransactions
} from '$features/wallet/services/walletService';
import type { Wallet, TransactionType } from '$features/wallet/types';
import { toast } from 'svelte-sonner';

const TRANSACTION_PAGE_SIZE = 50;

// Module-level singleton state (mirrors useAuth pattern)
let wallet = $state<Wallet>({ initialBalance: 0, transactions: [] });
let loading = $state(false);
let isLoaded = $state(false);
let hasMoreTransactions = $state(true);
let transactionOffset = $state(0);

export function useWalletStore() {
	const auth = useAuth();

	return {
		get wallet() {
			return wallet;
		},
		get loading() {
			return loading;
		},
		get isLoaded() {
			return isLoaded;
		},
		get hasMoreTransactions() {
			return hasMoreTransactions;
		},

		async loadWallet() {
			if (!auth.userId) return;
			loading = true;
			transactionOffset = 0;
			try {
				const { wallet: w, page } = await fetchWallet(auth.userId, {
					limit: TRANSACTION_PAGE_SIZE,
					offset: 0
				});
				wallet = w;
				hasMoreTransactions = page?.hasMore ?? false;
				isLoaded = true;
			} catch (error) {
				toast.error('Failed to load wallet');
				console.error(error);
			} finally {
				loading = false;
			}
		},

		async loadMoreTransactions() {
			if (!auth.userId || loading || !hasMoreTransactions) return;
			loading = true;
			try {
				const nextOffset = transactionOffset + TRANSACTION_PAGE_SIZE;
				const { wallet: w, page } = await fetchWallet(auth.userId, {
					limit: TRANSACTION_PAGE_SIZE,
					offset: nextOffset
				});
				wallet = {
					...wallet,
					transactions: [...wallet.transactions, ...w.transactions]
				};
				transactionOffset = nextOffset;
				hasMoreTransactions = page?.hasMore ?? false;
			} catch (error) {
				toast.error('Failed to load more transactions');
				console.error(error);
			} finally {
				loading = false;
			}
		},

		async adjustBalance(delta: number): Promise<void> {
			if (!auth.userId) throw new Error('Not authenticated');
			const newBalance = wallet.initialBalance + delta;
			try {
				await updateInitialBalance(auth.userId, newBalance);
				wallet = { ...wallet, initialBalance: newBalance };
			} catch (error) {
				toast.error('Failed to update balance');
				throw error;
			}
		},

		async setInitialBalance(amount: number): Promise<void> {
			if (!auth.userId) throw new Error('Not authenticated');
			try {
				await updateInitialBalance(auth.userId, amount);
				wallet = { ...wallet, initialBalance: amount };
			} catch (error) {
				toast.error('Failed to update initial balance');
				throw error;
			}
		},

		async addTransaction(
			type: TransactionType,
			amount: number,
			note = '',
			groupId: string | null = null,
			roundNumber: number | null = null,
			date?: string
		): Promise<void> {
			if (!auth.userId) throw new Error('Not authenticated');
			try {
				const txn = await addTransactionRecord(auth.userId, {
					type,
					amount,
					note,
					groupId,
					roundNumber,
					date
				});
				wallet = { ...wallet, transactions: [...wallet.transactions, txn] };
			} catch (error) {
				toast.error('Failed to add transaction');
				throw error;
			}
		},

		async removeTransaction(id: string): Promise<void> {
			try {
				await removeTransactionRecord(id);
				wallet = {
					...wallet,
					transactions: wallet.transactions.filter((t) => t.id !== id)
				};
			} catch (error) {
				toast.error('Failed to remove transaction');
				throw error;
			}
		},

		async adjustBalanceBatch(delta: number): Promise<void> {
			if (!auth.userId) throw new Error('Not authenticated');
			try {
				await adjustBalanceBatchService(auth.userId, delta);
				wallet = { ...wallet, initialBalance: wallet.initialBalance + delta };
			} catch (error) {
				toast.error('Failed to update balance');
				throw error;
			}
		},

		async addTransactionBatch(
			type: TransactionType,
			amounts: Array<{ amount: number; note?: string; groupId?: string | null; roundNumber?: number | null; date?: string }>
		): Promise<void> {
			if (!auth.userId) throw new Error('Not authenticated');
			try {
				const params = amounts.map((a) => ({
					type,
					amount: a.amount,
					note: a.note ?? '',
					groupId: a.groupId ?? null,
					roundNumber: a.roundNumber ?? null,
					date: a.date
				}));
				const txns = await addTransactionRecordBatch(auth.userId, params);
				wallet = { ...wallet, transactions: [...wallet.transactions, ...txns] };
			} catch (error) {
				toast.error('Failed to add transactions');
				throw error;
			}
		},

		clearAll(): void {
			wallet = { initialBalance: 0, transactions: [] };
			isLoaded = false;
			hasMoreTransactions = true;
			transactionOffset = 0;
		},

		async deleteAll(): Promise<void> {
			if (!auth.userId) throw new Error('Not authenticated');
			try {
				await deleteWalletAndTransactions(auth.userId);
				wallet = { initialBalance: 0, transactions: [] };
			} catch (error) {
				toast.error('ลบข้อมูลไม่สำเร็จ กรุณาลองใหม่');
				throw error;
			}
		},

		async clearAndReset(): Promise<void> {
			if (!auth.userId) throw new Error('Not authenticated');
			const prevBalance = wallet.initialBalance;
			try {
				await resetWallet(auth.userId, prevBalance);
				wallet = { initialBalance: 0, transactions: [] };
			} catch (error) {
				toast.error('รีเซ็ตกระเป๋าไม่สำเร็จ กรุณาลองใหม่');
				throw error;
			}
		}
	};
}
