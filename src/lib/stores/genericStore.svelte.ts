import { persistedState } from './persisted.svelte';

export interface GenericStoreOptions<T> {
	key: string;
	initial: T;
}

export function createGenericStore<T extends { id: string }>(options: GenericStoreOptions<T[]>) {
	const _store = persistedState<T[]>(options.key, options.initial);

	function getAll(): T[] {
		return _store.value;
	}

	function getById(id: string): T | undefined {
		return _store.value.find((item) => item.id === id);
	}

	function add(item: Omit<T, 'id'>): T {
		const full: T = {
			...item,
			id: crypto.randomUUID()
		} as T;
		_store.value = [..._store.value, full];
		return full;
	}

	function update(id: string, updater: (item: T) => T): void {
		_store.value = _store.value.map((item) => (item.id !== id ? item : updater(item)));
	}

	function remove(id: string): void {
		_store.value = _store.value.filter((item) => item.id !== id);
	}

	return {
		get items() {
			return getAll();
		},
		getById,
		add,
		update,
		remove
	};
}
