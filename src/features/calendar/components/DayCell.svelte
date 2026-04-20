<script lang="ts">
	import type { DayData } from '$features/calendar/types';
	import { formatCurrency } from '$lib/utils/calculator';

	interface Props {
		cell: { date: string; day: number };
		dayData: DayData | undefined;
		paidDayData: DayData | undefined;
		isToday: boolean;
		isLastRow: boolean;
		isSaturday: boolean;
		onclick: () => void;
	}

	let { cell, dayData, paidDayData, isToday, isLastRow, isSaturday, onclick }: Props = $props();

	const hasPayments = $derived(dayData?.transactions.some((t) => t.transaction.type === 'payment' || t.transaction.type === 'withdrawal') ?? false);
	const hasPayouts = $derived(dayData?.transactions.some((t) => t.transaction.type === 'payout' || t.transaction.type === 'deposit') ?? false);
	const hasEstimates = $derived(dayData?.transactions.some((t) => t.transaction.isEstimate) ?? false);
	const isNegative = $derived(dayData?.hasNegativeBalance ?? false);
	const hasUnpaid = $derived(dayData?.transactions.length !== paidDayData?.transactions.length);
</script>

<button
	type="button"
	{onclick}
	class="relative min-h-16 border-b border-border p-1 text-left transition-colors hover:bg-muted/50 {isToday ? 'bg-primary/5' : ''} {isLastRow ? 'border-b-0!' : ''} {!isSaturday ? 'border-r' : ''}"
>
	<span
		class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium {isToday ? 'bg-primary text-primary-foreground' : ''}"
	>
		{cell.day}
	</span>
	{#if dayData && dayData.transactions.length > 0}
		<p class="mt-0.5 text-[9px] leading-tight {isNegative ? 'text-red-500 font-bold' : hasEstimates ? 'text-muted-foreground' : 'text-foreground'}">
			{formatCurrency(dayData.balance).replace('฿', '')}
		</p>
		<div class="mt-1 flex gap-0.5">
			{#if hasPayments}
				<span class="h-1.5 w-1.5 rounded-full bg-red-400"></span>
			{/if}
			{#if hasPayouts}
				<span class="h-1.5 w-1.5 rounded-full bg-green-400"></span>
			{/if}
			{#if hasUnpaid}
				<span class="h-1.5 w-1.5 rounded-full bg-yellow-400"></span>
			{/if}
		</div>
	{/if}
</button>
