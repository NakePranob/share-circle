import { getOrCreateWallet, updateWallet, deleteWallet } from '$lib/supabase/wallets';
import {
	getTransactions,
	createTransaction,
	createTransactionBatch,
	deleteTransaction,
	deleteAllTransactions
} from '$lib/supabase/transactions';
import type { Wallet, Transaction, TransactionType } from '$features/wallet/types';
import { toISODate } from '$features/shared/utils/dateHelpers';

type SupabaseTransactionRow = Awaited<ReturnType<typeof getTransactions>>['data'][number];

export function mapTransactionRow(t: SupabaseTransactionRow): Transaction {
	return {
		id: t.id,
		groupId: t.group_id,
		roundNumber: t.round_number,
		date: t.date,
		actionAt: t.created_at ?? undefined,
		type: t.type as TransactionType,
		amount: t.amount,
		isEstimate: t.is_estimate ?? false,
		note: t.note ?? ''
	};
}

export interface TransactionPage {
	transactions: Transaction[];
	total: number;
	hasMore: boolean;
}

export async function fetchWallet(
	userId: string,
	options?: { limit?: number; offset?: number }
): Promise<{ wallet: Wallet; page?: TransactionPage }> {
	const limit = options?.limit ?? 50;
	const offset = options?.offset ?? 0;

	const [data, txResult] = await Promise.all([
		getOrCreateWallet(userId),
		getTransactions(userId, { limit, offset })
	]);

	const wallet: Wallet = {
		initialBalance: data?.initial_balance ?? 0,
		transactions: txResult.data.map(mapTransactionRow)
	};

	const page: TransactionPage = {
		transactions: wallet.transactions,
		total: txResult.total,
		hasMore: offset + limit < txResult.total
	};

	return { wallet, page };
}

export async function updateInitialBalance(userId: string, amount: number): Promise<void> {
	await updateWallet(userId, { initial_balance: amount });
}

export async function adjustBalanceBatch(userId: string, delta: number): Promise<void> {
	const wallet = await getOrCreateWallet(userId);
	const newBalance = (wallet.initial_balance ?? 0) + delta;
	await updateWallet(userId, { initial_balance: newBalance });
}

export interface AddTransactionParams {
	type: TransactionType;
	amount: number;
	note?: string;
	groupId?: string | null;
	roundNumber?: number | null;
	date?: string;
}

export async function addTransactionRecord(
	userId: string,
	params: AddTransactionParams
): Promise<Transaction> {
	const data = await createTransaction({
		user_id: userId,
		group_id: params.groupId ?? null,
		round_number: params.roundNumber ?? null,
		date: params.date ?? toISODate(new Date()),
		type: params.type,
		amount: params.amount,
		is_estimate: false,
		note: params.note || null
	});

	return mapTransactionRow(data);
}

export async function addTransactionRecordBatch(
	userId: string,
	params: AddTransactionParams[]
): Promise<Transaction[]> {
	const transactions = params.map((p) => ({
		user_id: userId,
		group_id: p.groupId ?? null,
		round_number: p.roundNumber ?? null,
		date: p.date ?? toISODate(new Date()),
		type: p.type,
		amount: p.amount,
		is_estimate: false,
		note: p.note || null
	}));

	const data = await createTransactionBatch(transactions);
	return data.map(mapTransactionRow);
}

export async function removeTransactionRecord(id: string): Promise<void> {
	await deleteTransaction(id);
}

export async function removeAllTransactions(userId: string): Promise<void> {
	await deleteAllTransactions(userId);
}

export async function resetWallet(userId: string, prevBalance: number): Promise<void> {
	await deleteAllTransactions(userId);
	try {
		await updateWallet(userId, { initial_balance: 0 });
	} catch (error) {
		// Transactions already deleted — attempt to restore balance before rethrowing
		await updateWallet(userId, { initial_balance: prevBalance }).catch((e) => {
			console.error('Failed to restore wallet balance after resetWallet failure', e);
		});
		throw error;
	}
}

export async function deleteWalletAndTransactions(userId: string): Promise<void> {
	await deleteAllTransactions(userId);
	try {
		await deleteWallet(userId);
	} catch {
		await deleteWallet(userId); // one retry
	}
}
