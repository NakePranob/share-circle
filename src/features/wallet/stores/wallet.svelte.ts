import { useAuth } from '$features/auth/composables/useAuth.svelte';
import { getOrCreateWallet, updateWallet, deleteWallet } from '$lib/supabase/wallets';
import { getTransactions, createTransaction, deleteTransaction, deleteAllTransactions } from '$lib/supabase/transactions';
import type { Wallet, Transaction, TransactionType } from '$features/wallet/types';
import { toISODate } from '$features/shared/utils/dateHelpers';
import { toast } from 'svelte-sonner';
import { SvelteDate } from 'svelte/reactivity';

class WalletStore {
	#auth = useAuth();
	#wallet = $state<Wallet>({
		initialBalance: 0,
		manualTransactions: []
	});
	#loading = $state(false);
	#isLoaded = $state(false);

	get wallet() {
		return this.#wallet;
	}

	get loading() {
		return this.#loading;
	}

	get isLoaded() {
		return this.#isLoaded;
	}

	async loadWallet() {
		if (!this.#auth.userId) return;
		this.#loading = true;
		try {
			const data = await getOrCreateWallet(this.#auth.userId);
			const transactions = await getTransactions(this.#auth.userId);

			this.#wallet = {
				initialBalance: data?.initial_balance ?? 0,
				manualTransactions: transactions.map((t) => ({
					id: t.id,
					groupId: t.group_id,
					roundNumber: t.round_number,
					date: t.date,
					actionAt: t.created_at ?? undefined,
					type: t.type as TransactionType,
					amount: t.amount,
					isEstimate: t.is_estimate ?? false,
					note: t.note ?? ''
				}))
			};
			this.#isLoaded = true;
		} catch (error) {
			toast.error('Failed to load wallet');
			console.error(error);
		} finally {
			this.#loading = false;
		}
	}

	async adjustBalance(delta: number): Promise<void> {
		if (!this.#auth.userId) throw new Error('Not authenticated');
		const newBalance = this.#wallet.initialBalance + delta;
		try {
			await updateWallet(this.#auth.userId, { initial_balance: newBalance });
			this.#wallet = { ...this.#wallet, initialBalance: newBalance };
		} catch (error) {
			toast.error('Failed to update balance');
			throw error;
		}
	}

	async setInitialBalance(amount: number): Promise<void> {
		if (!this.#auth.userId) throw new Error('Not authenticated');
		try {
			await updateWallet(this.#auth.userId, { initial_balance: amount });
			this.#wallet = { ...this.#wallet, initialBalance: amount };
		} catch (error) {
			toast.error('Failed to update initial balance');
			throw error;
		}
	}

	async addTransaction(
		type: TransactionType,
		amount: number,
		note = '',
		groupId: string | null = null,
		roundNumber: number | null = null
	): Promise<void> {
		if (!this.#auth.userId) throw new Error('Not authenticated');
		try {
			const data = await createTransaction({
				user_id: this.#auth.userId,
				wallet_id: null,
				group_id: groupId,
				round_number: roundNumber,
				date: toISODate(new SvelteDate()),
				type,
				amount,
				is_estimate: false,
				note: note || null
			});

			const txn: Transaction = {
				id: data.id,
				groupId: data.group_id,
				roundNumber: data.round_number,
				date: data.date,
				actionAt: data.created_at ?? undefined,
				type: data.type as TransactionType,
				amount: data.amount,
				isEstimate: data.is_estimate ?? false,
				note: data.note ?? ''
			};

			this.#wallet = {
				...this.#wallet,
				manualTransactions: [...this.#wallet.manualTransactions, txn]
			};
		} catch (error) {
			toast.error('Failed to add transaction');
			throw error;
		}
	}

	async removeTransaction(id: string): Promise<void> {
		try {
			await deleteTransaction(id);
			this.#wallet = {
				...this.#wallet,
				manualTransactions: this.#wallet.manualTransactions.filter((t) => t.id !== id)
			};
		} catch (error) {
			toast.error('Failed to remove transaction');
			throw error;
		}
	}

	clearAll(): void {
		this.#wallet = {
			initialBalance: 0,
			manualTransactions: []
		};
	}

	async deleteAll(): Promise<void> {
		if (!this.#auth.userId) throw new Error('Not authenticated');
		try {
			await deleteAllTransactions(this.#auth.userId);
			await deleteWallet(this.#auth.userId);
			this.#wallet = {
				initialBalance: 0,
				manualTransactions: []
			};
		} catch (error) {
			toast.error('Failed to delete wallet data');
			throw error;
		}
	}

	async clearAndReset(): Promise<void> {
		if (!this.#auth.userId) throw new Error('Not authenticated');
		try {
			await deleteAllTransactions(this.#auth.userId);
			await updateWallet(this.#auth.userId, { initial_balance: 0 });
			this.#wallet = {
				initialBalance: 0,
				manualTransactions: []
			};
		} catch (error) {
			toast.error('Failed to clear wallet data');
			throw error;
		}
	}
}

// Singleton instance
let walletStoreInstance: WalletStore | null = null;

export function useWalletStore(): WalletStore {
	if (!walletStoreInstance) {
		walletStoreInstance = new WalletStore();
	}
	return walletStoreInstance;
}
