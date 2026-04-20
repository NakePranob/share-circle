<script lang="ts">
	import type { DayData } from '$features/calendar/types';
	import { formatCurrency } from '$lib/utils/calculator';

	interface Props {
		cell: { date: string; day: number };
		dayData: DayData | undefined;
		paidDayData: DayData | undefined;
		projectedDayData: DayData | undefined;
		isToday: boolean;
		isLastRow: boolean;
		isSaturday: boolean;
		onclick: () => void;
	}

	let { cell, dayData, paidDayData, projectedDayData, isToday, isLastRow, isSaturday, onclick }: Props = $props();

	const isNegative = $derived(projectedDayData?.hasNegativeBalance ?? false);

	const paidPaymentIds = $derived(new Set(
		paidDayData?.transactions
			.filter((t) => t.transaction.type === 'payment')
			.map((t) => t.transaction.id.replace('-payment-paid', '-payment')) ?? []
	));
	const paidPayoutIds = $derived(new Set(
		paidDayData?.transactions
			.filter((t) => t.transaction.type === 'payout')
			.map((t) => t.transaction.id.replace('-payout-paid', '-payout')) ?? []
	));

	const hasUnpaid = $derived(dayData?.transactions.some((t) => t.transaction.type === 'payment' && !paidPaymentIds.has(t.transaction.id)) ?? false);
	const hasUnreceived = $derived(dayData?.transactions.some((t) => t.transaction.type === 'payout' && !paidPayoutIds.has(t.transaction.id)) ?? false);

	const hasAny = $derived(hasUnpaid || hasUnreceived);
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
	{#if hasAny}
		<p class="mt-0.5 text-[9px] leading-tight {isNegative ? 'text-red-500 font-bold' : 'text-muted-foreground'}">
			{formatCurrency(projectedDayData?.balance ?? 0).replace('฿', '')}
		</p>
		<div class="mt-1 flex gap-0.5">
			{#if hasUnpaid}
				<span class="h-1.5 w-1.5 rounded-full bg-red-400"></span>
			{/if}
			{#if hasUnreceived}
				<span class="h-1.5 w-1.5 rounded-full bg-green-400"></span>
			{/if}
		</div>
	{/if}
</button>
