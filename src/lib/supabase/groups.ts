import { supabase } from './client';
import type { Database } from './database.types';

export type Group = Database['public']['Tables']['groups']['Row'];
export type GroupInsert = Database['public']['Tables']['groups']['Insert'];
export type GroupUpdate = Database['public']['Tables']['groups']['Update'];

export async function getGroups(userId: string) {
	const { data, error } = await supabase
		.from('groups')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false });

	if (error) throw error;
	return data;
}

export async function getGroupById(id: string) {
	const { data, error } = await supabase.from('groups').select('*').eq('id', id).single();

	if (error) throw error;
	return data;
}

export async function createGroup(group: GroupInsert) {
	const { data, error } = await supabase.from('groups').insert(group).select().single();

	if (error) throw error;
	return data;
}

export async function updateGroup(id: string, updates: GroupUpdate) {
	const { data, error } = await supabase
		.from('groups')
		.update(updates)
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function deleteGroup(id: string) {
	const { error } = await supabase.from('groups').delete().eq('id', id);

	if (error) throw error;
}
