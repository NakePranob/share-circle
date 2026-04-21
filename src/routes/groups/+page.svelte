<script lang="ts">
	import { goto } from '$app/navigation';
	import { groupsStore } from '$features/groups/stores/groups.svelte';
	import { walletStore } from '$features/wallet/stores/wallet.svelte';
	import type { TransactionType } from '$features/wallet/types';
	import type { Round } from '$features/groups/types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { CirclePlus, Users, Trash2, Download, Upload, Copy, MoreVertical } from '@lucide/svelte';
	import GroupCard from '$features/groups/components/GroupCard.svelte';

	const groups = $derived(groupsStore.groups);
	const activeGroups = $derived(groups.filter((g) => g.isActive));
	const closedGroups = $derived(groups.filter((g) => !g.isActive));

	let showDeleteDialog = $state(false);
	let deleteConfirmText = $state('');
	let showExportDialog = $state(false);
	let showImportDialog = $state(false);
	let importJSONText = $state('');
	let showDuplicateDialog = $state(false);
	let duplicateNames = $state<string[]>([]);
	let groupsToImport = $state<Omit<{ id: string; name: string; rounds: Round[]; createdAt: string; isActive: boolean }, 'id' | 'createdAt'>[]>([]);
	let importDataTemp = $state('');
	let renamedGroups = $state<Record<number, string>>({});
	let groupsToRemove = $state(new Set<number>());

	function handleDeleteAll() {
		groupsStore.clearAll();
		walletStore.clearAll();
		showDeleteDialog = false;
		deleteConfirmText = '';
	}

	function exportData() {
		const data = {
			groups: groupsStore.groups,
			wallet: walletStore.wallet,
			exportedAt: new Date().toISOString()
		};
		return JSON.stringify(data, null, 2);
	}

	function downloadJSON() {
		const json = exportData();
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `share-circle-backup-${new Date().toISOString().split('T')[0]}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		showExportDialog = false;
	}

	async function copyJSON() {
		const json = exportData();
		await navigator.clipboard.writeText(json);
		showExportDialog = false;
	}

	async function importData(json: string) {
		try {
			const data = JSON.parse(json);
			if (!data.groups && !data.group) {
				throw new Error('Invalid data format');
			}
			const tempGroups = data.groups || (data.group ? [data.group] : []);

			// Check for duplicate group names
			const existingGroupNames = new Set(groupsStore.groups.map((g: { name: string }) => g.name));
			const tempDuplicateNames = tempGroups.filter((g: { name: string }) => existingGroupNames.has(g.name)).map((g: { name: string }) => g.name);

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
				data.wallet.manualTransactions.forEach((txn: { type: string; amount: number; note: string; groupId: string | null; roundNumber: number | null }) => walletStore.addTransaction(txn.type as TransactionType, txn.amount, txn.note, txn.groupId, txn.roundNumber));
			}
			showImportDialog = false;
			importJSONText = '';
		} catch {
			alert('Invalid JSON format');
		}
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
			data.wallet.manualTransactions.forEach((txn: { type: string; amount: number; note: string; groupId: string | null; roundNumber: number | null }) => walletStore.addTransaction(txn.type as TransactionType, txn.amount, txn.note, txn.groupId, txn.roundNumber));
		}
		showDuplicateDialog = false;
		showImportDialog = false;
		importJSONText = '';
		importDataTemp = '';
		duplicateNames = [];
		groupsToImport = [];
		renamedGroups = {};
		groupsToRemove.clear();
	}
</script>

<div class="p-4">
	<header class="mb-4 flex items-center justify-between">
		<h1 class="text-xl font-bold">วงแชร์</h1>
		<div class="flex gap-2">
			<Button onclick={() => goto('/groups/new')} size="sm">
				<CirclePlus class="mr-1 h-4 w-4" />
				สร้างวงใหม่
			</Button>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="outline" size="sm">
						<MoreVertical class="h-4 w-4" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-44">
					<DropdownMenu.Item onclick={() => showExportDialog = true}>
						<Download class="mr-2 h-4 w-4" />
						ส่งออก JSON
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => showImportDialog = true}>
						<Upload class="mr-2 h-4 w-4" />
						ส่งออก JSON
					</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item onclick={() => showDeleteDialog = true} variant="destructive">
						<Trash2 class="mr-2 h-4 w-4" />
						ล้างข้อมูลทั้งหมด
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</header>

	<Tabs value="active">
		<TabsList class="w-full space-x-1">
			<TabsTrigger value="active" class="flex-1 bg-background">กำลังดำเนิน ({activeGroups.length})</TabsTrigger>
			<TabsTrigger value="closed" class="flex-1 bg-background">ปิดแล้ว ({closedGroups.length})</TabsTrigger>
		</TabsList>

		<TabsContent value="active" class="mt-4">
			{#if activeGroups.length === 0}
				<div class="flex flex-col items-center justify-center py-16 text-center">
					<Users class="mb-4 h-12 w-12 text-muted-foreground/40" />
					<p class="mb-4 text-sm text-muted-foreground">ยังไม่มีวงที่กำลังดำเนิน</p>
					<Button onclick={() => goto('/groups/new')}>
						<CirclePlus class="mr-2 h-4 w-4" />
						สร้างวงใหม่
					</Button>
				</div>
			{:else}
				<div class="space-y-3">
					{#each activeGroups as group (group.id)}
						<GroupCard
							{group}
							isActive={true}
							onclick={() => goto(`/groups/${group.id}`)}
						/>
					{/each}
				</div>
			{/if}
		</TabsContent>

		<TabsContent value="closed" class="mt-4">
			{#if closedGroups.length === 0}
				<div class="flex flex-col items-center justify-center py-16 text-center">
					<p class="text-sm text-muted-foreground">ไม่มีวงที่ปิดแล้ว</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each closedGroups as group (group.id)}
						<GroupCard
							{group}
							isActive={false}
							onclick={() => goto(`/groups/${group.id}`)}
						/>
					{/each}
				</div>
			{/if}
		</TabsContent>
	</Tabs>
</div>

<!-- Delete Confirmation Dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>ล้างข้อมูลทั้งหมด</Dialog.Title>
			<Dialog.Description>
				การกระทำนี้จะลบข้อมูลวงแชร์และบันทึกการเงินทั้งหมด ไม่สามารถย้อนกลับได้
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="deleteConfirm">พิมพ์ "DELETE" เพื่อยืนยัน</Label>
				<Input
					id="deleteConfirm"
					bind:value={deleteConfirmText}
					placeholder="DELETE"
					class="uppercase"
				/>
			</div>
		</div>

		<Dialog.Footer>
			<Dialog.Close class="flex-1">
				<Button variant="outline" class="w-full md:flex-1">ยกเลิก</Button>
			</Dialog.Close>
			<Button
				onclick={handleDeleteAll}
				variant="destructive"
				class="w-full md:flex-1"
				disabled={deleteConfirmText !== 'DELETE'}
			>
				ล้างข้อมูล
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Export Dialog -->
<Dialog.Root bind:open={showExportDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>ส่งออก JSON</Dialog.Title>
			<Dialog.Description>
				Export ข้อมูลวงแชร์และบันทึกการเงินทั้งหมด
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			<Button onclick={downloadJSON} class="w-full">
				<Download class="mr-2 h-4 w-4" />
				Download
			</Button>
			<Button onclick={copyJSON} variant="outline" class="w-full">
				<Copy class="mr-2 h-4 w-4" />
				Copy to Clipboard
			</Button>
		</div>

		<Dialog.Footer>
			<Dialog.Close>
				<Button variant="outline" class="w-full">ปิด</Button>
			</Dialog.Close>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Import Dialog -->
<Dialog.Root bind:open={showImportDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>ส่งออก JSON</Dialog.Title>
			<Dialog.Description>
				Import ข้อมูลวงแชร์และบันทึกการเงินจากไฟล์ JSON
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="fileUpload">Upload File</Label>
				<Input id="fileUpload" type="file" accept=".json" onchange={handleFileUpload} />
			</div>

			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<span class="w-full border-t"></span>
				</div>
				<div class="relative flex justify-center text-xs uppercase">
					<span class="bg-background px-2 text-muted-foreground">หรือ</span>
				</div>
			</div>

			<div class="space-y-2">
				<Label for="pasteJSON">Paste JSON</Label>
				<Input
					id="pasteJSON"
					bind:value={importJSONText}
					placeholder="Paste JSON here..."
					class="font-mono text-xs"
				/>
			</div>

			<Button onclick={handleImportFromPaste} class="w-full" disabled={!importJSONText}>
				Import from Paste
			</Button>
		</div>

		<Dialog.Footer>
			<Dialog.Close>
				<Button variant="outline" class="w-full">ปิด</Button>
			</Dialog.Close>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Duplicate Group Names Dialog -->
<Dialog.Root bind:open={showDuplicateDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>ชื่อวงซ้ำ</Dialog.Title>
			<Dialog.Description>
				พบชื่อวงซ้ำ: {duplicateNames.join(', ')} กรุณาเปลี่ยนชื่อหรือยกเลิก
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			{#each groupsToImport as group, index (index)}
				{#if duplicateNames.includes(group.name)}
					<div class="flex items-center gap-2">
						<div class="flex-1 space-y-2">
							<Label for={`rename-${index}`}>เปลี่ยนชื่อ "{group.name}" เป็น</Label>
							<Input
								id={`rename-${index}`}
								bind:value={renamedGroups[index]}
								placeholder="ชื่อวงใหม่"
							/>
						</div>
						<Button
							variant="outline"
							size="sm"
							class="mt-6 {groupsToRemove.has(index) ? 'bg-destructive text-destructive-foreground' : ''}"
							onclick={() => {
								if (groupsToRemove.has(index)) {
									groupsToRemove.delete(index);
								} else {
									groupsToRemove.add(index);
								}
							}}
						>
							{groupsToRemove.has(index) ? 'เลิกลบ' : 'ลบ'}
						</Button>
					</div>
				{/if}
			{/each}
		</div>

		<Dialog.Footer>
			<Dialog.Close class="flex-1">
				<Button variant="outline" class="w-full">ยกเลิก</Button>
			</Dialog.Close>
			<Button onclick={handleImportWithRenamedGroups} class="w-full md:flex-1">
				Import
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
