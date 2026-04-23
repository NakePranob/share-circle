import { SvelteSet } from 'svelte/reactivity';
import { useGroupsStore } from '$features/groups/stores/groups.svelte';
import { useWalletStore } from '$features/wallet/stores/wallet.svelte';
import type { TransactionType } from '$features/wallet/types';
import type { Round } from '$features/groups/types';

/**
 * Class สำหรับจัดการ import ข้อมูล
 * ใช้ class ตาม Svelte 5 best practices เพื่อให้สามารถ bind กับ state ได้โดยตรง
 */
export class DataImport {
	importJSONText = $state('');
	showDuplicateDialog = $state(false);
	duplicateNames = $state<string[]>([]);
	groupsToImport = $state<
		Omit<{ id: string; name: string; rounds: Round[]; createdAt: string; isActive: boolean }, 'id' | 'createdAt'>[]
	>([]);
	importDataTemp = $state('');
	renamedGroups = $state<Record<number, string>>({});
	groupsToRemove = new SvelteSet<number>();
	importMode = $state<'add' | 'replace'>('add');
	hasWallet = $state(false);

	#groupsStore = useGroupsStore();
	#walletStore = useWalletStore();

	parseAndValidateJSON(json: string) {
		try {
			const data = JSON.parse(json);
			this.hasWallet = !!data.wallet;
			return true;
		} catch {
			this.hasWallet = false;
			return false;
		}
	}

	async importData(json: string, mode: 'add' | 'replace' = 'add') {
		try {
			const data = JSON.parse(json);
			if (!data.groups && !data.group) {
				throw new Error('Invalid data format');
			}
			const tempGroups = data.groups || (data.group ? [data.group] : []);

			// Replace mode: delete all data first
			if (mode === 'replace') {
				await this.#groupsStore.deleteAll();
				await this.#walletStore.clearAndReset();

				// Set initial balance from wallet data
				if (data.wallet && data.wallet.initialBalance !== undefined) {
					await this.#walletStore.setInitialBalance(data.wallet.initialBalance);
				}
			}

			// Check for duplicate group names (only in add mode)
			if (mode === 'add') {
				const existingGroupNames = new SvelteSet(this.#groupsStore.groups.map((g: { name: string }) => g.name));
				const tempDuplicateNames = tempGroups
					.filter((g: { name: string }) => existingGroupNames.has(g.name))
					.map((g: { name: string }) => g.name);

				if (tempDuplicateNames.length > 0) {
					this.duplicateNames = tempDuplicateNames;
					this.groupsToImport = tempGroups;
					this.importDataTemp = json;
					this.renamedGroups = {};
					this.groupsToRemove.clear();
					this.showDuplicateDialog = true;
					return;
				}
			}

			// Import groups
			tempGroups.forEach((group: Omit<{ id: string; name: string; rounds: Round[]; createdAt: string; isActive: boolean }, 'id' | 'createdAt'>) => this.#groupsStore.add(group));

			// Import wallet transactions
			if (data.wallet && data.wallet.manualTransactions) {
				data.wallet.manualTransactions.forEach((txn: {
					type: string;
					amount: number;
					note: string;
					groupId: string | null;
					roundNumber: number | null
				}) => this.#walletStore.addTransaction(txn.type as TransactionType, txn.amount, txn.note, txn.groupId, txn.roundNumber));
			}
			this.importJSONText = '';
			return true;
		} catch {
			alert('Invalid JSON format');
			return false;
		}
	}

	handleImportWithRenamedGroups() {
		this.groupsToImport.forEach((group, index) => {
			if (this.groupsToRemove.has(index)) return;
			const newName = this.renamedGroups[index];
			if (newName) {
				group.name = newName;
			}
			this.#groupsStore.add(group);
		});
		const data = JSON.parse(this.importDataTemp);
		if (data.wallet && data.wallet.manualTransactions) {
			data.wallet.manualTransactions.forEach((txn: {
				type: string;
				amount: number;
				note: string;
				groupId: string | null;
				roundNumber: number | null
			}) => this.#walletStore.addTransaction(txn.type as TransactionType, txn.amount, txn.note, txn.groupId, txn.roundNumber));
		}
		this.showDuplicateDialog = false;
		this.importJSONText = '';
		this.importDataTemp = '';
		this.duplicateNames = [];
		this.groupsToImport = [];
		this.renamedGroups = {};
		this.groupsToRemove.clear();
	}

	async handleFileUpload(event: Event, mode: 'add' | 'replace' = 'add') {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			const text = await file.text();
			await this.importData(text, mode);
		}
	}

	async handleImportFromPaste(mode: 'add' | 'replace' = 'add') {
		await this.importData(this.importJSONText, mode);
	}
}

// Singleton instance
let dataImportInstance: DataImport | null = null;

export function useDataImport() {
	if (!dataImportInstance) {
		dataImportInstance = new DataImport();
	}
	return dataImportInstance;
}
