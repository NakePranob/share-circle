import { SvelteSet, SvelteMap } from 'svelte/reactivity';
import { useGroupsStore } from '$features/groups/stores/groups.svelte';
import { useWalletStore } from '$features/wallet/stores/wallet.svelte';
import type { TransactionType } from '$features/wallet/types';
import type { Round } from '$features/groups/types';

type ImportGroup = Omit<
	{ id: string; name: string; rounds: Round[]; createdAt: string; isActive: boolean },
	'id' | 'createdAt'
> & { id?: string };

type ImportTransaction = {
	type: string;
	amount: number;
	note: string;
	groupId: string | null;
	roundNumber: number | null;
	date?: string;
};

function checkTransactionIntegrity(
	groups: ImportGroup[],
	transactions: ImportTransaction[]
): string[] {
	const missing: string[] = [];
	for (const group of groups) {
		const groupTxns = transactions.filter((t) => t.groupId === group.id);
		const hasMissing = group.rounds.some((round) => {
			if (round.status === 'paid') {
				const has = groupTxns.some(
					(t) => t.roundNumber === round.roundNumber && t.type === 'payment'
				);
				if (!has) return true;
			}
			if (round.isMyRound && round.payoutStatus === 'received') {
				const has = groupTxns.some(
					(t) => t.roundNumber === round.roundNumber && t.type === 'payout'
				);
				if (!has) return true;
			}
			return false;
		});
		if (hasMissing) missing.push(group.name);
	}
	return missing;
}

export class DataImport {
	importJSONText = $state('');
	showDuplicateDialog = $state(false);
	duplicateNames = $state<string[]>([]);
	groupsToImport = $state<ImportGroup[]>([]);
	importDataTemp = $state('');
	renamedGroups = $state<Record<number, string>>({});
	groupsToRemove = new SvelteSet<number>();
	importMode = $state<'add' | 'replace'>('add');
	hasWallet = $state(false);

	showIntegrityDialog = $state(false);
	groupsWithMissingTxns = $state<string[]>([]);
	#pendingImportJSON = '';


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
			const tempGroups: ImportGroup[] = data.groups || (data.group ? [data.group] : []);

			// Duplicate name check (add mode only)
			if (mode === 'add') {
				const existingGroupNames = new SvelteSet(
					this.#groupsStore.groups.map((g: { name: string }) => g.name)
				);
				const tempDuplicateNames = tempGroups
					.filter((g) => existingGroupNames.has(g.name))
					.map((g) => g.name);

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

			// Integrity check before any destructive API calls
			const walletTxns: ImportTransaction[] = data.wallet?.transactions ?? [];
			const missingGroups = checkTransactionIntegrity(tempGroups, walletTxns);
			if (missingGroups.length > 0) {
				this.groupsWithMissingTxns = missingGroups;
				this.#pendingImportJSON = json;
				this.importMode = mode;
				this.showIntegrityDialog = true;
				return;
			}

			await this.#doImportWithMode(json, mode);
		} catch {
			alert('Invalid JSON format');
		}
	}

	async confirmIntegrityReset() {
		this.showIntegrityDialog = false;
		const data = JSON.parse(this.#pendingImportJSON);
		const tempGroups: ImportGroup[] = data.groups || (data.group ? [data.group] : []);
		const missingSet = new SvelteSet(this.groupsWithMissingTxns);

		for (const group of tempGroups) {
			if (!missingSet.has(group.name)) continue;
			group.rounds = group.rounds.map((r) => ({
				...r,
				status: 'pending' as const,
				paidAt: undefined,
				payoutStatus: 'pending' as const,
				receivedAt: undefined
			}));
		}

		if (data.wallet?.transactions) {
			const affectedIds = new SvelteSet(
				tempGroups.filter((g) => missingSet.has(g.name)).map((g) => g.id)
			);
			data.wallet.transactions = (data.wallet.transactions as ImportTransaction[]).filter(
				(t) => !affectedIds.has(t.groupId ?? '')
			);
		}

		const cleanedJSON = JSON.stringify(data);
		await this.#doImportWithMode(cleanedJSON, this.importMode);
		this.groupsWithMissingTxns = [];
		this.#pendingImportJSON = '';
	}

	async skipIntegrityReset() {
		this.showIntegrityDialog = false;
		await this.#doImportWithMode(this.#pendingImportJSON, this.importMode);
		this.groupsWithMissingTxns = [];
		this.#pendingImportJSON = '';
	}

	async #doImportWithMode(json: string, mode: 'add' | 'replace') {
		if (mode === 'replace') {
			const data = JSON.parse(json);
			await this.#groupsStore.deleteAll();
			await this.#walletStore.clearAndReset();
			if (data.wallet?.initialBalance !== undefined) {
				await this.#walletStore.setInitialBalance(data.wallet.initialBalance);
			}
		}
		await this.#doImport(json);
	}

	async #doImport(json: string) {
		const data = JSON.parse(json);
		const tempGroups: ImportGroup[] = data.groups || (data.group ? [data.group] : []);

		const importedGroups = await Promise.all(tempGroups.map((group) => this.#groupsStore.add(group)));

		if (data.wallet?.transactions) {
			const idMap = new SvelteMap<string, string>(
				tempGroups.map((g, i) => [g.id ?? '', importedGroups[i].id])
			);

			await Promise.all(
				(data.wallet.transactions as ImportTransaction[]).map((txn) =>
					this.#walletStore.addTransaction(
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

		this.importJSONText = '';
	}

	async handleImportWithRenamedGroups() {
		const groupsToAdd: { group: ImportGroup; oldId: string }[] = [];
		this.groupsToImport.forEach((group, index) => {
			if (this.groupsToRemove.has(index)) return;
			const newName = this.renamedGroups[index];
			if (newName) group.name = newName;
			groupsToAdd.push({ group, oldId: group.id ?? '' });
		});

		const importedGroups = await Promise.all(groupsToAdd.map(({ group }) => this.#groupsStore.add(group)));

		const data = JSON.parse(this.importDataTemp);
		if (data.wallet?.transactions) {
			const idMap = new SvelteMap<string, string>(
				groupsToAdd.map(({ oldId }, i) => [oldId, importedGroups[i].id])
			);

			await Promise.all(
				(data.wallet.transactions as ImportTransaction[]).map((txn) =>
					this.#walletStore.addTransaction(
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
