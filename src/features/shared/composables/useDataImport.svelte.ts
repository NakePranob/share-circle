import { SvelteSet } from 'svelte/reactivity';
import { groupsStore } from '$features/groups/stores/groups.svelte';
import { walletStore } from '$features/wallet/stores/wallet.svelte';
import type { TransactionType } from '$features/wallet/types';
import type { Round } from '$features/groups/types';

/**
 * Composable สำหรับจัดการ import ข้อมูล
 * ย้าย logic import จาก component มาที่นี่
 */
export function useDataImport() {
	let importJSONText = $state('');
	let showDuplicateDialog = $state(false);
	let duplicateNames = $state<string[]>([]);
	let groupsToImport = $state<
		Omit<{ id: string; name: string; rounds: Round[]; createdAt: string; isActive: boolean }, 'id' | 'createdAt'>[]
	>([]);
	let importDataTemp = $state('');
	let renamedGroups = $state<Record<number, string>>({});
	const groupsToRemove = new SvelteSet<number>();

	async function importData(json: string) {
		try {
			const data = JSON.parse(json);
			if (!data.groups && !data.group) {
				throw new Error('Invalid data format');
			}
			const tempGroups = data.groups || (data.group ? [data.group] : []);

			// Check for duplicate group names
			const existingGroupNames = new SvelteSet(groupsStore.groups.map((g: { name: string }) => g.name));
			const tempDuplicateNames = tempGroups
				.filter((g: { name: string }) => existingGroupNames.has(g.name))
				.map((g: { name: string }) => g.name);

			if (tempDuplicateNames.length > 0) {
				duplicateNames = tempDuplicateNames;
				groupsToImport = tempGroups;
				importDataTemp = json;
				renamedGroups = {};
				groupsToRemove.clear();
				showDuplicateDialog = true;
				return;
			}

			tempGroups.forEach((group: Omit<{ id: string; name: string; rounds: Round[]; createdAt: string; isActive: boolean }, 'id' | 'createdAt'>) => groupsStore.add(group));
			if (data.wallet && data.wallet.manualTransactions) {
				data.wallet.manualTransactions.forEach((txn: {
					type: string;
					amount: number;
					note: string;
					groupId: string | null;
					roundNumber: number | null
				}) => walletStore.addTransaction(txn.type as TransactionType, txn.amount, txn.note, txn.groupId, txn.roundNumber));
			}
			importJSONText = '';
			return true;
		} catch {
			alert('Invalid JSON format');
			return false;
		}
	}

	function handleImportWithRenamedGroups() {
		groupsToImport.forEach((group, index) => {
			if (groupsToRemove.has(index)) return;
			const newName = renamedGroups[index];
			if (newName) {
				group.name = newName;
			}
			groupsStore.add(group);
		});
		const data = JSON.parse(importDataTemp);
		if (data.wallet && data.wallet.manualTransactions) {
			data.wallet.manualTransactions.forEach((txn: {
				type: string;
				amount: number;
				note: string;
				groupId: string | null;
				roundNumber: number | null
			}) => walletStore.addTransaction(txn.type as TransactionType, txn.amount, txn.note, txn.groupId, txn.roundNumber));
		}
		showDuplicateDialog = false;
		importJSONText = '';
		importDataTemp = '';
		duplicateNames = [];
		groupsToImport = [];
		renamedGroups = {};
		groupsToRemove.clear();
	}

	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			const text = await file.text();
			await importData(text);
		}
	}

	async function handleImportFromPaste() {
		await importData(importJSONText);
	}

	return {
		importJSONText,
		showDuplicateDialog,
		duplicateNames,
		groupsToImport,
		renamedGroups,
		groupsToRemove,
		importData,
		handleImportWithRenamedGroups,
		handleFileUpload,
		handleImportFromPaste
	};
}
