import { useAuth } from '$features/auth/composables/useAuth.svelte';
import { useGroupsStore } from '$features/groups/stores/groups.svelte';
import { useWalletStore } from '$features/wallet/stores/wallet.svelte';
import { toast } from 'svelte-sonner';

// Module-level state (shared across all instances)
let loading = $state(false);
let isLoaded = $state(false);

/**
 * Composable สำหรับจัดการการ load ข้อมูลเริ่มต้นทั้งหมดของ app
 * เป็นจุดเดียวที่ load groups (พร้อม rounds) และ wallet
 * เรียกใช้ใน +layout.svelte เพื่อ load ข้อมูลเมื่อ user auth แล้ว
 */
export function useAppData() {
	const auth = useAuth();
	const groupsStore = useGroupsStore();
	const walletStore = useWalletStore();

	// Load all data when user is authenticated
	$effect(() => {
		if (auth.userId && !isLoaded && !loading) {
			loadAllData();
		} else if (!auth.userId && isLoaded) {
			// Reset when user logs out
			isLoaded = false;
			groupsStore.clearAll();
			walletStore.clearAll();
		}
	});

	async function loadAllData() {
		if (!auth.userId || loading) return;
		loading = true;
		try {
			// Load groups (includes rounds)
			await groupsStore.loadGroups();
			// Load wallet
			await walletStore.loadWallet();
			isLoaded = true;
		} catch (error) {
			toast.error('Failed to load data');
			console.error('Failed to load app data:', error);
		} finally {
			loading = false;
		}
	}

	return {
		get loading() {
			return loading;
		},
		get isLoaded() {
			return isLoaded;
		},
		loadAllData
	};
}
