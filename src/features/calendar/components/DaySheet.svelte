<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { SvelteDate } from 'svelte/reactivity';
	import type { DayData } from '$features/shared/types';
	import { formatCurrency } from '$lib/utils/calculator';

	interface Props {
		selectedDay: DayData | null;
		paidCashFlow: Map<string, DayData>;
		onClose: () => void;
		onMarkAsPaid: (groupId: string, roundNumber: number) => void;
	}

	let { selectedDay, paidCashFlow, onClose, onMarkAsPaid }: Props = $props();

	function txnLabel(type: string) {
		if (type === 'payment') return '💸 จ่าย';
		if (type === 'payout') return '💰 รับ';
		if (type === 'deposit') return '➕ เติม';
		if (type === 'withdrawal') return '➖ เบิก';
		return type;
	}
</script>

<Sheet.Root open={selectedDay !== null} onOpenChange={(o) => !o && onClose()}>
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
			<div class="mt-4 space-y-2 overflow-y-auto pb-8 px-4">
				<div class="mb-4 flex items-center justify-between rounded-lg bg-muted/50 p-3">
					<span class="text-sm">ยอดคงเหลือ</span>
					<span class="font-bold {selectedDay.hasNegativeBalance ? 'text-red-500' : 'text-green-600 dark:text-green-400'}">
						{formatCurrency(selectedDay.balance)}
					</span>
				</div>

				{#if selectedDay.transactions.length === 0}
					<p class="py-4 text-center text-sm text-muted-foreground">ไม่มีรายการในวันนี้</p>
				{:else}
					{#each selectedDay.transactions as { transaction, groupName } (transaction.id)}
						{@const isPaid = paidDayData?.transactions.some((t) => 
							t.transaction.groupId === transaction.groupId && 
							t.transaction.roundNumber === transaction.roundNumber && 
							t.transaction.type === transaction.type
						)}
						{@const canPay = !isPaid && (transaction.type === 'payment' || transaction.type === 'payout') && transaction.groupId && transaction.roundNumber}
						<div class="flex items-center justify-between rounded-lg border border-border p-3 {isPaid ? 'bg-muted/30' : ''}">
							<div>
								<p class="text-sm font-medium">{txnLabel(transaction.type)}</p>
								<p class="text-xs text-muted-foreground">
									{transaction.note || groupName || '—'}
									{#if transaction.isEstimate}
										<span class="italic"> (ประมาณ)</span>
									{/if}
									{#if !isPaid && (transaction.type === 'payment' || transaction.type === 'payout')}
										<span class="ml-2 text-yellow-600 font-medium">• ยังไม่จ่าย</span>
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
							</div>
						</div>
					{/each}
				{/if}
			</div>
		{/if}
	</Sheet.Content>
</Sheet.Root>
