import { useAuth } from '$features/auth/composables/useAuth.svelte';
import { getOrCreateWallet, updateWallet } from '$lib/supabase/wallets';
import { getTransactions, createTransaction, deleteTransaction } from '$lib/supabase/transactions';
import type { Wallet, Transaction, TransactionType } from '$features/wallet/types';
import { toISODate } from '$features/shared/utils/dateHelpers';
import { toast } from 'svelte-sonner';
import { SvelteDate } from 'svelte/reactivity';

export function useWalletStore() {
	const auth = useAuth();

	let wallet = $state<Wallet>({
		initialBalance: 0,
		manualTransactions: []
	});
	let loading = $state(false);
	let isLoaded = $state(false);

async function loadWallet() {
	if (!auth.userId) return;
	loading = true;
	try {
		const data = await getOrCreateWallet(auth.userId);
		const transactions = await getTransactions(auth.userId);
		
		wallet = {
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
		isLoaded = true;
	} catch (error) {
		toast.error('Failed to load wallet');
		console.error(error);
	} finally {
		loading = false;
	}
}

async function setInitialBalance(amount: number): Promise<void> {
	if (!auth.userId) throw new Error('Not authenticated');
	try {
		await updateWallet(auth.userId, { initial_balance: amount });
		wallet = { ...wallet, initialBalance: amount };
	} catch (error) {
		toast.error('Failed to update initial balance');
		throw error;
	}
}

async function addTransaction(
	type: TransactionType,
	amount: number,
	note = '',
	groupId: string | null = null,
	roundNumber: number | null = null
): Promise<void> {
	if (!auth.userId) throw new Error('Not authenticated');
	try {
		const data = await createTransaction({
			user_id: auth.userId,
			wallet_id: null, // Will be set by RLS or we need to get wallet ID
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
		
		wallet = {
			...wallet,
			manualTransactions: [...wallet.manualTransactions, txn]
		};
	} catch (error) {
		toast.error('Failed to add transaction');
		throw error;
	}
}

async function removeTransaction(id: string): Promise<void> {
	try {
		await deleteTransaction(id);
		wallet = {
			...wallet,
			manualTransactions: wallet.manualTransactions.filter((t) => t.id !== id)
		};
	} catch (error) {
		toast.error('Failed to remove transaction');
		throw error;
	}
}

function clearAll(): void {
	wallet = {
		initialBalance: 0,
		manualTransactions: []
	};
}

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
		loadWallet,
		setInitialBalance,
		addTransaction,
		removeTransaction,
		clearAll
	};
}
