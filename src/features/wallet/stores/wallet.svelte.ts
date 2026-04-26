import { useAuth } from '$features/auth/composables/useAuth.svelte';
import {
	fetchWallet,
	updateInitialBalance,
	addTransactionRecord,
	removeTransactionRecord,
	resetWallet,
	deleteWalletAndTransactions
} from '$features/wallet/services/walletService';
import type { Wallet, TransactionType } from '$features/wallet/types';
import { toast } from 'svelte-sonner';

// Module-level singleton state (mirrors useAuth pattern)
let wallet = $state<Wallet>({ initialBalance: 0, transactions: [] });
let loading = $state(false);
let isLoaded = $state(false);

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

		async loadWallet() {
			if (!auth.userId) return;
			loading = true;
			try {
				wallet = await fetchWallet(auth.userId);
				isLoaded = true;
			} catch (error) {
				toast.error('Failed to load wallet');
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

		clearAll(): void {
			wallet = { initialBalance: 0, transactions: [] };
			isLoaded = false;
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
