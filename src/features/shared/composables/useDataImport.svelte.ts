import { SvelteSet, SvelteMap } from 'svelte/reactivity';
import { useGroupsStore } from '$features/groups/stores/groups.svelte';
import { useWalletStore } from '$features/wallet/stores/wallet.svelte';
import type { TransactionType } from '$features/wallet/types';
import {
	parseImportJSON,
	checkDuplicateNames,
	checkTransactionIntegrity,
	resolveIntegrityConflicts
} from '$features/shared/services/importService';
import type {
	ImportGroup,
	ImportTransaction,
	ImportData
} from '$features/shared/services/importService';

function createDataImport() {
	const groupsStore = useGroupsStore();
	const walletStore = useWalletStore();

	let importJSONText = $state('');
	let showDuplicateDialog = $state(false);
	let duplicateNames = $state<string[]>([]);
	let groupsToImport = $state<ImportGroup[]>([]);
	let importDataTemp = $state('');
	let renamedGroups = $state<Record<number, string>>({});
	const groupsToRemove = new SvelteSet<number>();
	let importMode = $state<'add' | 'replace'>('add');
	let hasWallet = $state(false);
	let showIntegrityDialog = $state(false);
	let groupsWithMissingTxns = $state<string[]>([]);
	let pendingImportData: ImportData | null = null;

	function parseAndValidateJSON(json: string) {
		try {
			const data = JSON.parse(json);
			hasWallet = !!data.wallet;
			return true;
		} catch {
			hasWallet = false;
			return false;
		}
	}

	async function doImport(data: ImportData) {
		const importedGroups = await Promise.all(data.groups.map((group) => groupsStore.add(group)));

		if (data.wallet?.transactions) {
			const idMap = new SvelteMap<string, string>(
				data.groups.map((g, i) => [g.id ?? '', importedGroups[i].id])
			);

			await Promise.all(
				(data.wallet.transactions as ImportTransaction[]).map((txn) =>
					walletStore.addTransaction(
						txn.type as TransactionType,
						txn.amount,
						txn.note,
						txn.groupId ? (idMap.get(txn.groupId) ?? txn.groupId) : null,
						txn.roundNumber,
						txn.date
					)
				)
			);
		}

		importJSONText = '';
	}

	async function doImportWithMode(data: ImportData, mode: 'add' | 'replace') {
		if (mode === 'replace') {
			await groupsStore.deleteAll();
			await walletStore.clearAndReset();
			if (data.wallet?.initialBalance !== undefined) {
				await walletStore.setInitialBalance(data.wallet.initialBalance);
			}
		}
		await doImport(data);
	}

	async function importData(json: string, mode: 'add' | 'replace' = 'add') {
		try {
			const parsed = parseImportJSON(json);

			// Duplicate name check (add mode only)
			if (mode === 'add') {
				const existingNames = groupsStore.groups.map((g) => g.name);
				const dupes = checkDuplicateNames(parsed.groups, existingNames);
				if (dupes.length > 0) {
					duplicateNames = dupes;
					groupsToImport = parsed.groups;
					importDataTemp = json;
					renamedGroups = {};
					groupsToRemove.clear();
					showDuplicateDialog = true;
					return;
				}
			}

			// Integrity check before destructive API calls
			const walletTxns: ImportTransaction[] = parsed.wallet?.transactions ?? [];
			const missing = checkTransactionIntegrity(parsed.groups, walletTxns);
			if (missing.length > 0) {
				groupsWithMissingTxns = missing;
				pendingImportData = parsed;
				importMode = mode;
				showIntegrityDialog = true;
				return;
			}

			await doImportWithMode(parsed, mode);
		} catch {
			alert('Invalid JSON format');
		}
	}

	async function confirmIntegrityReset() {
		showIntegrityDialog = false;
		if (!pendingImportData) return;
		const cleaned = resolveIntegrityConflicts(pendingImportData, groupsWithMissingTxns);
		await doImportWithMode(cleaned, importMode);
		groupsWithMissingTxns = [];
		pendingImportData = null;
	}

	async function skipIntegrityReset() {
		showIntegrityDialog = false;
		if (!pendingImportData) return;
		await doImportWithMode(pendingImportData, importMode);
		groupsWithMissingTxns = [];
		pendingImportData = null;
	}

	async function handleImportWithRenamedGroups() {
		const groupsToAdd: { group: ImportGroup; oldId: string }[] = [];
		groupsToImport.forEach((group, index) => {
			if (groupsToRemove.has(index)) return;
			const newName = renamedGroups[index];
			if (newName) group.name = newName;
			groupsToAdd.push({ group, oldId: group.id ?? '' });
		});

		const importedGroups = await Promise.all(
			groupsToAdd.map(({ group }) => groupsStore.add(group))
		);

		const data = JSON.parse(importDataTemp) as { wallet?: { transactions?: ImportTransaction[] } };
		if (data.wallet?.transactions) {
			const idMap = new SvelteMap<string, string>(
				groupsToAdd.map(({ oldId }, i) => [oldId, importedGroups[i].id])
			);

			await Promise.all(
				(data.wallet.transactions as ImportTransaction[]).map((txn) =>
					walletStore.addTransaction(
						txn.type as TransactionType,
						txn.amount,
						txn.note,
						txn.groupId ? (idMap.get(txn.groupId) ?? txn.groupId) : null,
						txn.roundNumber,
						txn.date
					)
				)
			);
		}

		showDuplicateDialog = false;
		importJSONText = '';
		importDataTemp = '';
		duplicateNames = [];
		groupsToImport = [];
		renamedGroups = {};
		groupsToRemove.clear();
	}

	async function handleFileUpload(event: Event, mode: 'add' | 'replace' = 'add') {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			const text = await file.text();
			await importData(text, mode);
		}
	}

	async function handleImportFromPaste(mode: 'add' | 'replace' = 'add') {
		await importData(importJSONText, mode);
	}

	return {
		get importJSONText() {
			return importJSONText;
		},
		set importJSONText(v: string) {
			importJSONText = v;
		},
		get showDuplicateDialog() {
			return showDuplicateDialog;
		},
		set showDuplicateDialog(v: boolean) {
			showDuplicateDialog = v;
		},
		get duplicateNames() {
			return duplicateNames;
		},
		get groupsToImport() {
			return groupsToImport;
		},
		get importDataTemp() {
			return importDataTemp;
		},
		get renamedGroups() {
			return renamedGroups;
		},
		set renamedGroups(v: Record<number, string>) {
			renamedGroups = v;
		},
		get groupsToRemove() {
			return groupsToRemove;
		},
		get importMode() {
			return importMode;
		},
		set importMode(v: 'add' | 'replace') {
			importMode = v;
		},
		get hasWallet() {
			return hasWallet;
		},
		set hasWallet(v: boolean) {
			hasWallet = v;
		},
		get showIntegrityDialog() {
			return showIntegrityDialog;
		},
		set showIntegrityDialog(v: boolean) {
			showIntegrityDialog = v;
		},
		get groupsWithMissingTxns() {
			return groupsWithMissingTxns;
		},
		parseAndValidateJSON,
		importData,
		confirmIntegrityReset,
		skipIntegrityReset,
		handleImportWithRenamedGroups,
		handleFileUpload,
		handleImportFromPaste
	};
}

// Singleton instance
let instance: ReturnType<typeof createDataImport> | null = null;

export function useDataImport() {
	if (!instance) {
		instance = createDataImport();
	}
	return instance;
}
