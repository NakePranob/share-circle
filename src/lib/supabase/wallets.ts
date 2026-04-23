import { supabase } from './client';
import type { Database } from './database.types';

export type Wallet = Database['public']['Tables']['wallets']['Row'];
export type WalletInsert = Database['public']['Tables']['wallets']['Insert'];
export type WalletUpdate = Database['public']['Tables']['wallets']['Update'];

export async function getWallet(userId: string) {
	const { data, error } = await supabase.from('wallets').select('*').eq('user_id', userId).single();

	if (error) {
		if (error.code === 'PGRST116') {
			// No wallet found, return null
			return null;
		}
		throw error;
	}
	return data;
}

export async function createWallet(wallet: WalletInsert) {
	const { data, error } = await supabase.from('wallets').insert(wallet).select().single();

	if (error) throw error;
	return data;
}

export async function updateWallet(userId: string, updates: WalletUpdate) {
	const { data, error } = await supabase
		.from('wallets')
		.update(updates)
		.eq('user_id', userId)
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function getOrCreateWallet(userId: string) {
	let wallet = await getWallet(userId);
	if (!wallet) {
		wallet = await createWallet({ user_id: userId, initial_balance: 0 });
	}
	return wallet;
}
