import { useAuth } from '$features/auth/composables/useAuth.svelte';
import { useGroupsStore } from '$features/groups/stores/groups.svelte';
import { useWalletStore } from '$features/wallet/stores/wallet.svelte';
import { toast } from 'svelte-sonner';
import { browser } from '$app/environment';

async function withRetry<T>(
	fn: () => Promise<T>,
	maxRetries = 3,
	delayMs = 1000
): Promise<T> {
	let lastError: Error | null = null;
	for (let i = 0; i < maxRetries; i++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error as Error;
			if (i < maxRetries - 1) {
				await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
			}
		}
	}
	throw lastError;
}

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
			await withRetry(async () => {
				await Promise.all([
					this.#groupsStore.loadGroups(),
					this.#walletStore.loadWallet()
				]);
			});
			this.#isLoaded = true;
		} catch (error) {
			toast.error('Failed to load data. Retrying...');
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
	let prevUserId: string | undefined = undefined;

	$effect.root(() => {
		if (!browser) return;

		$effect(() => {
			const userId = auth.userId;

			if (userId === prevUserId || (!userId && !prevUserId)) return;
			prevUserId = userId ?? undefined;

			if (userId && !store.isLoaded && !store.loading) {
				store.loadAllData();
			} else if (!userId && store.isLoaded) {
				store.reset();
			}
		});
	});

	return store;
}
