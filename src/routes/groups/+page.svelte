<script lang="ts">
	import { goto } from '$app/navigation';
	import { useGroupsStore } from '$features/groups/stores/groups.svelte';
	import { useWalletStore } from '$features/wallet/stores/wallet.svelte';
	import { useDataExport, useDataImport } from '$features/shared/composables';
	import { toast } from 'svelte-sonner';

	const groupsStore = useGroupsStore();
	const walletStore = useWalletStore();
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { CirclePlus, Users, Trash2, Download, Upload, Copy, MoreVertical } from '@lucide/svelte';
	import GroupCard from '$features/groups/components/GroupCard.svelte';
	import { Switch } from '$lib/components/ui/switch';

	const groups = $derived(groupsStore.groups);
	const activeGroups = $derived(groups.filter((g: { isActive: boolean }) => g.isActive));
	const closedGroups = $derived(groups.filter((g: { isActive: boolean }) => !g.isActive));

	const dataExport = useDataExport();
	const dataImport = useDataImport();

	let showDeleteDialog = $state(false);
	let deleteConfirmText = $state('');
	let showExportDialog = $state(false);
	let showImportDialog = $state(false);
	let showReplaceConfirmDialog = $state(false);
	let isDeleting = $state(false);
	let isImporting = $state(false);
	let isExporting = $state(false);
	let isCopying = $state(false);
	let isImportingFromPaste = $state(false);
	let isImportingWithRename = $state(false);
	let localImportMode = $state(false);

	// Validate JSON when text changes
	$effect(() => {
		if (dataImport.importJSONText) {
			dataImport.parseAndValidateJSON(dataImport.importJSONText);
		} else {
			dataImport.hasWallet = false;
		}
	});

	// Sync local import mode with composable
	$effect(() => {
		dataImport.importMode = localImportMode ? 'replace' : 'add';
	});

	async function handleDeleteAll() {
		isDeleting = true;
		try {
			await groupsStore.deleteAll();
			await walletStore.clearAndReset();
			showDeleteDialog = false;
			deleteConfirmText = '';
			toast.success('ลบข้อมูลทั้งหมดเรียบร้อย');
		} catch (error) {
			console.error('Failed to delete all data:', error);
		} finally {
			isDeleting = false;
		}
	}

	async function downloadJSON() {
		isExporting = true;
		try {
			dataExport.downloadJSON();
			showExportDialog = false;
		} finally {
			isExporting = false;
		}
	}

	async function copyJSON() {
		isCopying = true;
		try {
			await dataExport.copyJSON();
			showExportDialog = false;
		} finally {
			isCopying = false;
		}
	}

	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			const text = await file.text();
			dataImport.importJSONText = text;
		}
	}

	async function handleImportFromPaste() {
		isImportingFromPaste = true;
		try {
			if (localImportMode) {
				showReplaceConfirmDialog = true;
				return;
			}
			await dataImport.handleImportFromPaste(localImportMode ? 'replace' : 'add');
		} finally {
			isImportingFromPaste = false;
		}
	}

	async function confirmReplaceImport() {
		isImporting = true;
		try {
			await dataImport.importData(dataImport.importJSONText, 'replace');
			showReplaceConfirmDialog = false;
			showImportDialog = false;
		} catch (error) {
			console.error('Failed to replace import:', error);
		} finally {
			isImporting = false;
		}
	}

	async function handleImportWithRenamedGroups() {
		isImportingWithRename = true;
		try {
			dataImport.handleImportWithRenamedGroups();
			showImportDialog = false;
		} finally {
			isImportingWithRename = false;
		}
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
					<DropdownMenu.Item onclick={() => (showExportDialog = true)}>
						<Download class="mr-2 h-4 w-4" />
						ส่งออก JSON
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => (showImportDialog = true)}>
						<Upload class="mr-2 h-4 w-4" />
						นำเข้า JSON
					</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item onclick={() => (showDeleteDialog = true)} variant="destructive">
						<Trash2 class="mr-2 h-4 w-4" />
						ล้างข้อมูลทั้งหมด
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</header>

	<Tabs value="active">
		<TabsList class="w-full space-x-1">
			<TabsTrigger value="active" class="flex-1 bg-background rounded-e">
				กำลังดำเนิน ({activeGroups.length})
			</TabsTrigger>
			<TabsTrigger value="closed" class="flex-1 bg-background rounded-s">
				ปิดแล้ว ({closedGroups.length})
			</TabsTrigger>
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
						<GroupCard {group} isActive={true} onclick={() => goto(`/groups/${group.id}`)} />
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
						<GroupCard {group} isActive={false} onclick={() => goto(`/groups/${group.id}`)} />
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
			<Button
				onclick={handleDeleteAll}
				variant="destructive"
				class="w-full md:flex-1"
				disabled={deleteConfirmText !== 'DELETE' || isDeleting}
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
			<Dialog.Description>Export ข้อมูลวงแชร์และบันทึกการเงินทั้งหมด</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button onclick={downloadJSON} disabled={isExporting}>
				<Download class="mr-2 h-4 w-4" />
				{isExporting ? 'กำลังดาวน์โหลด...' : 'Download'}
			</Button>
			<Button onclick={copyJSON} variant="outline" disabled={isCopying}>
				<Copy class="mr-2 h-4 w-4" />
				{isCopying ? 'กำลังคัดลอก...' : 'Copy to Clipboard'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Import Dialog -->
<Dialog.Root bind:open={showImportDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>นำเข้า JSON</Dialog.Title>
			<Dialog.Description>Import ข้อมูลวงแชร์และบันทึกการเงินจากไฟล์ JSON</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label for="importMode">โหมดนำเข้า</Label>
					<p class="text-xs text-muted-foreground">
						{localImportMode ? 'ทับข้อมูลทั้งหมด' : 'เพิ่ม groups เข้าไป'}
					</p>
				</div>
				<Switch id="importMode" bind:checked={localImportMode} disabled={!dataImport.hasWallet} />
			</div>
			{#if !dataImport.hasWallet && dataImport.importJSONText}
				<p class="text-xs text-muted-foreground">
					JSON ไม่มีข้อมูล wallet จึงไม่สามารถใช้โหมดทับข้อมูลได้
				</p>
			{/if}

			<div class="space-y-2">
				<Label for="fileUpload">Upload File</Label>
				<Input
					id="fileUpload"
					type="file"
					accept=".json"
					onchange={handleFileUpload}
					disabled={isImporting}
				/>
				{#if isImporting}
					<p class="text-sm text-muted-foreground">กำลังนำเข้าข้อมูล...</p>
				{/if}
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
					bind:value={dataImport.importJSONText}
					placeholder="Paste JSON here..."
					class="font-mono text-xs"
				/>
			</div>
		</div>

		<Dialog.Footer>
			<Button
				onclick={handleImportFromPaste}
				class="w-full"
				disabled={!dataImport.importJSONText || isImportingFromPaste}
			>
				{isImportingFromPaste || isImporting ? 'กำลังนำเข้า...' : 'นำเข้าข้อมูล'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Duplicate Group Names Dialog -->
<Dialog.Root bind:open={dataImport.showDuplicateDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>ชื่อวงซ้ำ</Dialog.Title>
			<Dialog.Description>
				พบชื่อวงซ้ำ: {dataImport.duplicateNames.join(', ')} กรุณาเปลี่ยนชื่อหรือยกเลิก
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			{#each dataImport.groupsToImport as group, index (index)}
				{#if dataImport.duplicateNames.includes(group.name)}
					<div class="flex items-center gap-2">
						<div class="flex-1 space-y-2">
							<Label for={`rename-${index}`}>เปลี่ยนชื่อ "{group.name}" เป็น</Label>
							<Input
								id={`rename-${index}`}
								bind:value={dataImport.renamedGroups[index]}
								placeholder="ชื่อวงใหม่"
							/>
						</div>
						<Button
							variant="outline"
							size="sm"
							class="mt-6 {dataImport.groupsToRemove.has(index)
								? 'text-destructive-foreground bg-destructive'
								: ''}"
							onclick={() => {
								if (dataImport.groupsToRemove.has(index)) {
									dataImport.groupsToRemove.delete(index);
								} else {
									dataImport.groupsToRemove.add(index);
								}
							}}
						>
							{dataImport.groupsToRemove.has(index) ? 'เลิกลบ' : 'ลบ'}
						</Button>
					</div>
				{/if}
			{/each}
		</div>

		<Dialog.Footer>
			<Button
				onclick={handleImportWithRenamedGroups}
				class="w-full"
				disabled={isImportingWithRename}
			>
				{isImportingWithRename ? 'กำลังนำเข้า...' : 'Import'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Transaction Integrity Dialog -->
<Dialog.Root bind:open={dataImport.showIntegrityDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Transaction ขาดหาย</Dialog.Title>
			<Dialog.Description>
				วงต่อไปนี้มีมือ ที่จ่าย/รับแล้ว แต่ไม่มี transaction log:
			</Dialog.Description>
		</Dialog.Header>

		<ul class="my-2 space-y-2 rounded-xl bg-secondary p-4">
			{#each dataImport.groupsWithMissingTxns as name (name)}
				<li class="flex items-center gap-2 rounded-lg bg-background py-2 px-4 shadow text-sm">
					<span class="h-1.5 w-1.5 rounded-full bg-destructive"></span>
					{name}
				</li>
			{/each}
		</ul>
		<p class="text-sm text-muted-foreground">
			ถ้ายืนยัน: มือทั้งหมดของวงเหล่านี้จะถูกรีเซ็ตเป็นยังไม่จ่าย/รับ และ transaction
			ของวงเหล่านี้จะถูกลบออก
		</p>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => dataImport.skipIntegrityReset()}>
				นำเข้าต่อโดยไม่แก้
			</Button>
			<Button variant="destructive" onclick={() => dataImport.confirmIntegrityReset()}>
				ยืนยันรีเซ็ตมือ
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Replace Confirmation Dialog -->
<Dialog.Root bind:open={showReplaceConfirmDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>ยืนยันการทับข้อมูล</Dialog.Title>
			<Dialog.Description>
				การกระทำนี้จะลบข้อมูลวงแชร์และบันทึกการเงินทั้งหมด แล้วนำเข้าข้อมูลใหม่ ไม่สามารถย้อนกลับได้
			</Dialog.Description>
		</Dialog.Header>

		<Dialog.Footer>
			<Button
				onclick={confirmReplaceImport}
				variant="destructive"
				class="w-full md:flex-1"
				disabled={isImporting}
			>
				{isImporting ? 'กำลังทับข้อมูล...' : 'ทับข้อมูล'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
