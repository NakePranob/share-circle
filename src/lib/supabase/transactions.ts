import { supabase } from './client';
import type { Database } from './database.types';

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export async function getTransactions(
	userId: string,
	options?: { groupId?: string; limit?: number }
) {
	let query = supabase
		.from('transactions')
		.select('*')
		.eq('user_id', userId)
		.order('date', { ascending: false });

	if (options?.groupId) {
		query = query.eq('group_id', options.groupId);
	}
	if (options?.limit) {
		query = query.limit(options.limit);
	}

	const { data, error } = await query;

	if (error) throw error;
	return data;
}

export async function getTransactionById(id: string) {
	const { data, error } = await supabase.from('transactions').select('*').eq('id', id).single();

	if (error) throw error;
	return data;
}

export async function createTransaction(transaction: TransactionInsert) {
	const { data, error } = await supabase.from('transactions').insert(transaction).select().single();

	if (error) throw error;
	return data;
}

export async function createTransactionBatch(transactions: TransactionInsert[]) {
	const { data, error } = await supabase.from('transactions').insert(transactions).select();

	if (error) throw error;
	return data;
}

export async function updateTransaction(id: string, updates: TransactionUpdate) {
	const { data, error } = await supabase
		.from('transactions')
		.update(updates)
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function deleteTransaction(id: string) {
	const { error } = await supabase.from('transactions').delete().eq('id', id);

	if (error) throw error;
}

export async function getTransactionsByDateRange(
	userId: string,
	startDate: string,
	endDate: string
) {
	const { data, error } = await supabase
		.from('transactions')
		.select('*')
		.eq('user_id', userId)
		.gte('date', startDate)
		.lte('date', endDate)
		.order('date', { ascending: false });

	if (error) throw error;
	return data;
}

export async function deleteAllTransactions(userId: string) {
	const { error } = await supabase.from('transactions').delete().eq('user_id', userId);

	if (error) throw error;
}
