<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { useGroupsStore } from '$features/groups/stores/groups.svelte';
	import { useWalletStore } from '$features/wallet/stores/wallet.svelte';
	import { formatCurrency, formatDate } from '$features/shared/utils';

	const groupsStore = useGroupsStore();
	const walletStore = useWalletStore();
	import { useGroupStats, useGroupSummary } from '$features/groups/composables';
	import { calculateRoundProfit, getMyRoundNumbers } from '$features/groups/utils/formatters';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { CircleCheck, Circle, ArrowLeft, EllipsisVertical, Pencil, Download, Copy } from '@lucide/svelte';
	import type { Round } from '$lib/types';

	const id = $derived(page.params.id ?? '');
	const group = $derived(groupsStore.getById(id));
	let loadedId = $state('');

// Load rounds when id changes
$effect.pre(() => {
	if (id && id !== loadedId) {
		groupsStore.loadGroupWithRounds(id);
		loadedId = id;
	}
});

	let editRound = $state<Round | null>(null);
	let editDate = $state('');
	let editAmount = $state(0);
	let editPaymentAmount = $state(0);
	let showDeleteDialog = $state(false);
	let showExportDialog = $state(false);
	let isSaving = $state(false);
	let isDeleting = $state(false);
	let isToggling = $state(false);

	const { paidCount } = useGroupStats();
	const groupSummary = useGroupSummary(() => group);

	function openEdit(round: Round) {
		editRound = round;
		editDate = round.date;
		editAmount = round.receiveAmount;
		editPaymentAmount = round.paymentAmount;
	}

	async function saveEdit() {
		if (!group || !editRound) return;
		isSaving = true;
		try {
			await groupsStore.updateRound(group.id, editRound.roundNumber, {
				date: editDate,
				receiveAmount: editAmount,
				paymentAmount: editPaymentAmount
			});
			toast.success('แก้ไขเรียบร้อย');
			editRound = null;
		} catch (error) {
			console.error('Failed to update round:', error);
		} finally {
			isSaving = false;
		}
	}

	async function markPaid(roundNumber: number) {
		if (!group) return;
		const round = group.rounds.find((r) => r.roundNumber === roundNumber);
		try {
			await groupsStore.markRoundPaid(group.id, roundNumber);
			if (round) {
				await walletStore.adjustBalance(-round.paymentAmount);
				await walletStore.addTransaction('payment', round.paymentAmount, '', group.id, roundNumber);
			}
			toast.success('บันทึกแล้ว');
		} catch (error) {
			console.error('Failed to mark as paid:', error);
		}
	}

	async function markPending(roundNumber: number) {
		if (!group) return;
		const round = group.rounds.find((r) => r.roundNumber === roundNumber);
		try {
			await groupsStore.markRoundPending(group.id, roundNumber);
			if (round) {
				await walletStore.adjustBalance(+round.paymentAmount);
			}
			toast.success('ย้อนกลับเป็นรอแล้ว');
		} catch (error) {
			console.error('Failed to mark as pending:', error);
		}
	}

	async function markReceived(roundNumber: number) {
		if (!group) return;
		const round = group.rounds.find((r) => r.roundNumber === roundNumber);
		try {
			await groupsStore.markRoundReceived(group.id, roundNumber);
			if (round) {
				const net = round.receiveAmount - (round.managementFee ?? 0);
				await walletStore.adjustBalance(+net);
				await walletStore.addTransaction('payout', net, '', group.id, roundNumber);
			}
			toast.success('บันทึกแล้ว');
		} catch (error) {
			console.error('Failed to mark as received:', error);
		}
	}

	async function markReceivedPending(roundNumber: number) {
		if (!group) return;
		const round = group.rounds.find((r) => r.roundNumber === roundNumber);
		try {
			await groupsStore.markRoundReceivedPending(group.id, roundNumber);
			if (round) {
				const net = round.receiveAmount - (round.managementFee ?? 0);
				await walletStore.adjustBalance(-net);
			}
			toast.success('ย้อนกลับเป็นรอแล้ว');
		} catch (error) {
			console.error('Failed to mark as received pending:', error);
		}
	}

	async function deleteGroup() {
		if (!group) return;
		isDeleting = true;
		try {
			await groupsStore.remove(group.id);
			toast.success('ลบวงแล้ว');
			goto('/groups');
		} catch (error) {
			console.error('Failed to delete group:', error);
		} finally {
			isDeleting = false;
		}
	}

	async function toggleActive() {
		if (!group) return;
		isToggling = true;
		try {
			await groupsStore.toggleActive(group.id);
			toast.success(group.isActive ? 'ปิดวงแล้ว' : 'เปิดวงอีกครั้ง');
		} catch (error) {
			console.error('Failed to toggle active:', error);
		} finally {
			isToggling = false;
		}
	}

	function toggleMyRound(roundNumber: number) {
		if (!group) return;
		groupsStore.toggleMyRound(group.id, roundNumber);
		toast.success('ตั้งเป็นมือรับแล้ว');
	}

	function removeMyRound(roundNumber: number) {
		if (!group) return;
		groupsStore.removeMyRound(group.id, roundNumber);
		toast.success('ยกเลิกมือรับแล้ว');
	}

	function exportGroupData(): string {
		if (!group) return JSON.stringify({ group: null, exportedAt: new Date().toISOString() }, null, 2);
		const data = {
			group: group,
			exportedAt: new Date().toISOString()
		};
		return JSON.stringify(data, null, 2);
	}

	function downloadGroupJSON() {
		if (!group) return;
		const json = exportGroupData();
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `share-circle-group-${group.name}-${new Date().toISOString().split('T')[0]}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		showExportDialog = false;
	}

	async function copyGroupJSON() {
		if (!group) return;
		const json = exportGroupData();
		await navigator.clipboard.writeText(json);
		showExportDialog = false;
		toast.success('คัดลอกแล้ว');
	}

	// Preview calc for edit dialog
	const editPreviewOwe = $derived(editRound && !editRound.isMyRound ? editPaymentAmount : 0);

	const editPreviewReceive = $derived.by(() => {
		if (!editRound?.isMyRound) return 0;
		return editAmount;
	});
</script>

{#if !group}
	<div class="flex h-full items-center justify-center p-8">
		<p class="text-muted-foreground">ไม่พบวงแชร์</p>
	</div>
{:else}
	<div class="p-4">
		<header class="mb-4 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<button type="button" onclick={() => goto('/groups')} class="text-muted-foreground hover:text-foreground">
					<ArrowLeft class="h-5 w-5" />
				</button>
				<div>
					<h1 class="text-xl font-bold">{group.name}</h1>
					{#if !group.isActive}
						<Badge variant="outline" class="text-xs opacity-60">ปิดแล้ว</Badge>
					{/if}
				</div>
			</div>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<button type="button" class="rounded-full p-2 hover:bg-muted">
						<EllipsisVertical class="h-5 w-5" />
					</button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-44">
					<DropdownMenu.Item onclick={toggleActive} disabled={isToggling}>
						{isToggling ? 'กำลังบันทึก...' : (group.isActive ? 'ปิดวง' : 'เปิดวงอีกครั้ง')}
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => showDeleteDialog = true} variant="destructive" disabled={isDeleting}>
						ลบวง
					</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item onclick={() => showExportDialog = true}>
						<Download class="mr-2 h-4 w-4" />
						ส่งออก JSON
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</header>

		<!-- Summary -->
		<div class="mb-4 grid grid-cols-2 gap-3">
			<div class="rounded-xl bg-green-50 p-3 dark:bg-green-950/20">
				<p class="text-xs text-muted-foreground">รับรวม</p>
				<p class="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(groupSummary.sumReceive)}</p>
			</div>
			<div class="rounded-xl bg-red-50 p-3 dark:bg-red-950/20">
				<p class="text-xs text-muted-foreground">จ่ายรวม</p>
				<p class="text-lg font-bold text-red-500">{formatCurrency(groupSummary.sumOwe)}</p>
			</div>
		</div>

		<!-- Info -->
		<div class="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-muted/50 p-4 text-sm">
			<div>
				<p class="text-xs text-muted-foreground">จำนวนมือ</p>
				<p class="font-medium">{group.rounds.length} มือ</p>
			</div>
			<div>
				<p class="text-xs text-muted-foreground">มือของเรา</p>
				<p class="font-medium">{getMyRoundNumbers(group)}</p>
			</div>
			<div>
				<p class="text-xs text-muted-foreground">จ่ายเฉลี่ย/มือ</p>
				<p class="font-medium">{formatCurrency(groupSummary.owe)}</p>
			</div>
			<div>
				<p class="text-xs text-muted-foreground">ความคืบหน้า</p>
				<p class="font-medium">{paidCount(group)}/{group.rounds.length} มือ</p>
			</div>
		</div>

		<div class="mb-3 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
			<span class="text-muted-foreground">กำไร/ขาดทุน</span>
			<span class="font-bold {groupSummary.isProfitable ? 'text-green-600' : 'text-red-500'}">
				{groupSummary.isProfitable ? '+' : ''}{formatCurrency(groupSummary.profit)}
			</span>
		</div>

		<Separator class="mb-4" />

		<!-- Rounds list -->
		<h2 class="mb-3 font-semibold">รายการมือ</h2>
		<div class="space-y-2">
			{#each group.rounds as round (round.roundNumber)}
				<div class="rounded-xl border bg-card p-4 {round.isMyRound ? 'border-green-200 dark:border-green-900' : 'border-border'} {round.status === 'paid' ? 'opacity-70' : ''}">
					<div class="mb-2 flex items-center justify-between">
						<div class="flex items-center gap-2">
							{#if round.status === 'paid'}
								<CircleCheck class="h-4 w-4 text-green-500" />
							{:else}
								<Circle class="h-4 w-4 text-muted-foreground" />
							{/if}
							<span class="font-medium">มือ {round.roundNumber}</span>
							{#if round.isMyRound}
								<span class="rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-medium text-white">เรารับ</span>
							{/if}
							<span class="text-xs text-muted-foreground">{formatDate(round.date)}</span>
						</div>
						<div class="flex items-center gap-1">
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									<button type="button" class="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
										<EllipsisVertical class="h-3.5 w-3.5" />
									</button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content class="w-40">
									<DropdownMenu.Item onclick={() => openEdit(round)}>
										<Pencil class="mr-2 h-3.5 w-3.5" />
										แก้ไข
									</DropdownMenu.Item>
									{#if round.isMyRound}
										<DropdownMenu.Item onclick={() => removeMyRound(round.roundNumber)} variant="destructive">
											ยกเลิกมือรับ
										</DropdownMenu.Item>
									{:else}
										<DropdownMenu.Item onclick={() => toggleMyRound(round.roundNumber)}>
											ตั้งเป็นมือรับ
										</DropdownMenu.Item>
									{/if}
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</div>
					</div>

					<div class="mb-3 flex items-center justify-between text-sm">
						{#if round.isMyRound}
							<div>
								<p class="text-xs text-muted-foreground">เราได้รับ</p>
								<p class="font-bold text-green-600 dark:text-green-400">{formatCurrency(round.receiveAmount)}</p>
							</div>
							<div class="text-right">
								<p class="text-xs text-muted-foreground">สุทธิ</p>
								<p class="font-bold {calculateRoundProfit(round) >= 0 ? 'text-green-600' : 'text-red-500'}">
									{calculateRoundProfit(round) >= 0 ? '+' : ''}{formatCurrency(calculateRoundProfit(round))}
								</p>
							</div>
						{:else}
							<div>
								<p class="text-xs text-muted-foreground">เราจ่าย</p>
								<p class="font-bold text-red-500">{formatCurrency(round.paymentAmount)}</p>
							</div>
							<div class="text-right">
								<p class="text-xs text-muted-foreground">ยอดรับของมือนี้</p>
								<p class="text-sm text-muted-foreground">{formatCurrency(round.receiveAmount)}</p>
							</div>
						{/if}
					</div>

					{#if round.isMyRound}
						<div class="flex gap-2">
							{#if round.status === 'pending'}
								<Button size="sm" variant="outline" onclick={() => markPaid(round.roundNumber)} class="flex-1">
									<CircleCheck class="mr-1 h-3 w-3" />
									จ่ายแล้ว
								</Button>
							{:else}
								<button type="button" onclick={() => markPending(round.roundNumber)} class="flex-1 rounded-md py-1 text-xs text-muted-foreground hover:text-foreground">
									↩ ย้อนกลับ (จ่าย)
								</button>
							{/if}
							{#if round.payoutStatus !== 'received'}
								<Button size="sm" onclick={() => markReceived(round.roundNumber)} class="flex-1 bg-green-600 hover:bg-green-700 text-white">
									<CircleCheck class="mr-1 h-3 w-3" />
									รับแล้ว
								</Button>
							{:else}
								<button type="button" onclick={() => markReceivedPending(round.roundNumber)} class="flex-1 rounded-md py-1 text-xs text-muted-foreground hover:text-foreground">
									↩ ย้อนกลับ (รับ)
								</button>
							{/if}
						</div>
					{:else if round.status === 'pending'}
						<Button size="sm" variant="outline" onclick={() => markPaid(round.roundNumber)} class="w-full">
							<CircleCheck class="mr-1 h-3 w-3" />
							จ่ายแล้ว
						</Button>
					{:else}
						<button type="button" onclick={() => markPending(round.roundNumber)} class="w-full rounded-md py-1 text-xs text-muted-foreground hover:text-foreground">
							↩ ย้อนกลับ
						</button>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Edit dialog -->
	<Dialog.Root open={editRound !== null} onOpenChange={(o) => !o && (editRound = null)}>
		<Dialog.Content class="max-w-sm">
			<Dialog.Header>
				<Dialog.Title>
					แก้ไขมือ {editRound?.roundNumber}
					{#if editRound?.isMyRound}
						<span class="text-sm font-normal text-green-600"> (มือของเรา)</span>
					{/if}
				</Dialog.Title>
			</Dialog.Header>

			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="edit-date">วันที่</Label>
					<Input id="edit-date" type="date" bind:value={editDate} />
				</div>
				<div class="space-y-2">
					<Label for="edit-payment-amount">ยอดจ่ายต่อมือ (บาท)</Label>
					<Input id="edit-payment-amount" type="number" min="1" bind:value={editPaymentAmount} />
				</div>
				<div class="space-y-2">
					<Label for="edit-amount">ยอดรับของมือนี้ (บาท)</Label>
					<Input id="edit-amount" type="number" min="1" bind:value={editAmount} />
				</div>

				<div class="rounded-lg bg-muted/50 p-3 text-sm">
					{#if editRound?.isMyRound}
						<div class="flex justify-between">
							<span>เราได้รับ</span>
							<span class="font-bold text-green-600">{formatCurrency(editPreviewReceive)}</span>
						</div>
					{:else}
						<div class="flex justify-between">
							<span>เราจ่าย</span>
							<span class="font-bold text-red-500">{formatCurrency(editPreviewOwe)}</span>
						</div>
					{/if}
				</div>
			</div>

			<Dialog.Footer>
				<Button variant="outline" onclick={() => (editRound = null)}>ยกเลิก</Button>
				<Button onclick={saveEdit} disabled={isSaving}>
					{isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Delete confirmation -->
	<AlertDialog.Root open={showDeleteDialog} onOpenChange={(o) => (showDeleteDialog = o)}>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>ลบวงแชร์</AlertDialog.Title>
				<AlertDialog.Description>
					ต้องการลบวง "{group.name}" ใช่ไหม? ไม่สามารถย้อนกลับได้
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>ยกเลิก</AlertDialog.Cancel>
				<AlertDialog.Action
					onclick={deleteGroup}
					class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					disabled={isDeleting}
				>
					{isDeleting ? 'กำลังลบ...' : 'ลบ'}
				</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>

	<!-- Export Dialog -->
	<Dialog.Root bind:open={showExportDialog}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>ส่งออก JSON</Dialog.Title>
				<Dialog.Description>
					Export ข้อมูลวงแชร์ "{group?.name}"
				</Dialog.Description>
			</Dialog.Header>

			<div class="space-y-4 py-4">
				<Button onclick={downloadGroupJSON} class="w-full">
					<Download class="mr-2 h-4 w-4" />
					Download
				</Button>
				<Button onclick={copyGroupJSON} variant="outline" class="w-full">
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
{/if}
