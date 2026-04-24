import { browser } from '$app/environment';
import { SvelteDate } from 'svelte/reactivity';
import { useGroupsStore } from '$features/groups/stores/groups.svelte';
import { useWalletStore } from '$features/wallet/stores/wallet.svelte';

/**
 * Composable สำหรับจัดการ export ข้อมูล
 * ย้าย logic export จาก component มาที่นี่
 */
export function useDataExport() {
	const groupsStore = useGroupsStore();
	const walletStore = useWalletStore();

	function exportData() {
		const data = {
			groups: groupsStore.groups,
			wallet: walletStore.wallet,
			exportedAt: new SvelteDate().toISOString()
		};
		return JSON.stringify(data, null, 2);
	}

	function downloadJSON(filename?: string) {
		if (!browser) return;
		const json = exportData();
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename || `share-circle-backup-${new SvelteDate().toISOString().split('T')[0]}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function copyJSON() {
		if (!browser) return;
		const json = exportData();
		await navigator.clipboard.writeText(json);
	}

	return {
		exportData,
		downloadJSON,
		copyJSON
	};
}
