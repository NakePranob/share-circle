<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { formatCurrency } from '$lib/utils/calculator';
	import type { Round } from '$features/shared/types';

	interface Props {
		editRound: Round | null;
		editDate: string;
		editAmount: number;
		editPreviewOwe: number;
		editPreviewReceive: number;
		onClose: () => void;
		onSave: () => void;
	}

	let {
		editRound,
		editDate,
		editAmount,
		editPreviewOwe,
		editPreviewReceive,
		onClose,
		onSave
	}: Props = $props();
</script>

<Dialog.Root open={editRound !== null} onOpenChange={(o) => !o && onClose()}>
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
			<Button variant="outline" onclick={onClose}>ยกเลิก</Button>
			<Button onclick={onSave}>บันทึก</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
