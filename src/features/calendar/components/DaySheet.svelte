<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { SvelteDate } from 'svelte/reactivity';
	import type { DayData } from '$features/calendar/types';
	import type { Group } from '$features/groups/types';
	import { formatCurrency } from '$lib/utils/calculator';

	interface Props {
		selectedDay: DayData | null;
		open: boolean;
		paidCashFlow: Map<string, DayData>;
		groups: Group[];
		onClose: () => void;
		onMarkAsPaid: (groupId: string, roundNumber: number) => void;
		onMarkAsReceived: (groupId: string, roundNumber: number) => void;
	}

	let { selectedDay, open, paidCashFlow, groups, onClose, onMarkAsPaid, onMarkAsReceived }: Props = $props();

	const groupTransactions = $derived(
		selectedDay?.transactions.filter((t) => t.transaction.groupId && t.transaction.roundNumber) ?? []
	);

	function getRound(groupId: string, roundNumber: number) {
		return groups.find((g) => g.id === groupId)?.rounds.find((r) => r.roundNumber === roundNumber);
	}

	function txnLabel(type: string) {
		if (type === 'payment') return '💸 จ่าย';
		if (type === 'payout') return '💰 รับ';
		if (type === 'deposit') return '➕ เติม';
		if (type === 'withdrawal') return '➖ เบิก';
		return type;
	}
</script>

<Sheet.Root {open} onOpenChange={(o) => !o && onClose()}>
	<Sheet.Content side="bottom" class="max-h-[60vh] rounded-t-2xl">
		<Sheet.Header>
			<Sheet.Title>
				{#if selectedDay}
					{new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }).format(new SvelteDate(selectedDay.date))}
				{/if}
			</Sheet.Title>
		</Sheet.Header>

		{#if selectedDay}
			{@const paidDayData = paidCashFlow.get(selectedDay.date)}
			{@const displayBalance = paidDayData?.balance ?? 0}
			{@const isNegative = paidDayData?.hasNegativeBalance ?? false}
			<div class="mt-4 space-y-2 overflow-y-auto pb-8 px-4">
				<div class="mb-4 flex items-center justify-between rounded-lg bg-muted/50 p-3">
					<span class="text-sm">ยอดคงเหลือ</span>
					<span class="font-bold {isNegative ? 'text-red-500' : 'text-green-600 dark:text-green-400'}">
						{formatCurrency(displayBalance)}
					</span>
				</div>

				{#if groupTransactions.length === 0}
					<p class="py-4 text-center text-sm text-muted-foreground">ไม่มีรายการในวันนี้</p>
				{:else}
					{#each groupTransactions as { transaction, groupName } (transaction.id)}
						{@const round = transaction.groupId && transaction.roundNumber ? getRound(transaction.groupId, transaction.roundNumber) : null}
						{@const isPaid = transaction.type === 'payment' ? round?.status === 'paid' : transaction.type === 'payout' ? round?.payoutStatus === 'received' : true}
						{@const canPay = !isPaid && transaction.type === 'payment' && transaction.groupId && transaction.roundNumber}
						{@const canReceive = !isPaid && transaction.type === 'payout' && transaction.groupId && transaction.roundNumber}
						<div class="flex items-center justify-between rounded-lg border border-border p-3 {isPaid ? 'bg-muted/30' : ''}">
							<div>
								<p class="text-sm font-medium">{txnLabel(transaction.type)}</p>
								<p class="text-xs text-muted-foreground">
									{transaction.note || groupName || '—'}
									{#if transaction.isEstimate}
										<span class="italic"> (ประมาณ)</span>
									{/if}
									{#if !isPaid && transaction.type === 'payment'}
										<span class="ml-2 text-red-600 font-medium">• ยังไม่จ่าย</span>
									{/if}
									{#if !isPaid && transaction.type === 'payout'}
										<span class="ml-2 text-green-600 font-medium">• ยังไม่รับ</span>
									{/if}
								</p>
							</div>
							<div class="flex items-center gap-2">
								<p class="font-medium {transaction.type === 'payment' || transaction.type === 'withdrawal' ? 'text-red-500' : 'text-green-600 dark:text-green-400'}">
									{transaction.type === 'payment' || transaction.type === 'withdrawal' ? '-' : '+'}
									{formatCurrency(transaction.amount)}
								</p>
								{#if canPay}
									<Button
										size="sm"
										variant="outline"
										onclick={() => onMarkAsPaid(transaction.groupId!, transaction.roundNumber!)}
									>
										จ่าย
									</Button>
								{/if}
								{#if canReceive}
									<Button
										size="sm"
										variant="outline"
										class="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
										onclick={() => onMarkAsReceived(transaction.groupId!, transaction.roundNumber!)}
									>
										รับ
									</Button>
								{/if}
							</div>
						</div>
					{/each}
				{/if}
			</div>
		{/if}
	</Sheet.Content>
</Sheet.Root>
