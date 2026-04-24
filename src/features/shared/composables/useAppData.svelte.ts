import { useAuth } from '$features/auth/composables/useAuth.svelte';
import { useGroupsStore } from '$features/groups/stores/groups.svelte';
import { useWalletStore } from '$features/wallet/stores/wallet.svelte';
import { toast } from 'svelte-sonner';
import { browser } from '$app/environment';

class AppDataStore {
	#auth = useAuth();
	#groupsStore = useGroupsStore();
	#walletStore = useWalletStore();
	#loading = $state(false);
	#isLoaded = $state(false);

	get loading() {
		return this.#loading;
	}

	get isLoaded() {
		return this.#isLoaded;
	}

	async loadAllData() {
		if (!this.#auth.userId || this.#loading) return;
		this.#loading = true;
		try {
			await this.#groupsStore.loadGroups();
			await this.#walletStore.loadWallet();
			this.#isLoaded = true;
		} catch (error) {
			toast.error('Failed to load data');
			console.error('Failed to load app data:', error);
		} finally {
			this.#loading = false;
		}
	}

	reset() {
		this.#isLoaded = false;
		this.#groupsStore.clearAll();
		this.#walletStore.clearAll();
	}
}

let appDataInstance: AppDataStore | null = null;

function getAppDataStore(): AppDataStore {
	// Never cache on server — each SSR request gets a fresh instance
	if (!browser) return new AppDataStore();
	if (!appDataInstance) {
		appDataInstance = new AppDataStore();
	}
	return appDataInstance;
}

export function useAppData() {
	const store = getAppDataStore();
	const auth = useAuth();

	$effect(() => {
		if (!browser) return;
		if (auth.userId && !store.isLoaded && !store.loading) {
			store.loadAllData();
		} else if (!auth.userId && store.isLoaded) {
			store.reset();
		}
	});

	return store;
}
