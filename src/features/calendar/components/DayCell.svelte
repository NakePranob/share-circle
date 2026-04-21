<script lang="ts">
	import type { DayData } from '$features/calendar/types';
	import type { Group } from '$features/groups/types';
	import { formatCurrency } from '$lib/utils/calculator';
	import { startOfDay } from 'date-fns';

	interface Props {
		cell: { date: string; day: number };
		dayData: DayData | undefined;
		projectedDayData: DayData | undefined;
		groups: Group[];
		isToday: boolean;
		isLastRow: boolean;
		isSaturday: boolean;
		onclick: () => void;
	}

	let { cell, dayData, projectedDayData, groups, isToday, isLastRow, isSaturday, onclick }: Props = $props();

	const isNegative = $derived(projectedDayData?.hasNegativeBalance ?? false);

	// check status จาก round โดยตรง ไม่ depend on paidAt date
	const groupMap = $derived(new Map(groups.map((g) => [g.id, g])));

	const hasUnpaid = $derived(
		dayData?.transactions.some((t) => {
			if (t.transaction.type !== 'payment' || !t.transaction.groupId || !t.transaction.roundNumber) return false;
			const round = groupMap.get(t.transaction.groupId)?.rounds.find((r) => r.roundNumber === t.transaction.roundNumber);
			return round?.status !== 'paid';
		}) ?? false
	);

	const hasUnreceived = $derived(
		dayData?.transactions.some((t) => {
			if (t.transaction.type !== 'payout' || !t.transaction.groupId || !t.transaction.roundNumber) return false;
			const round = groupMap.get(t.transaction.groupId)?.rounds.find((r) => r.roundNumber === t.transaction.roundNumber);
			return round?.payoutStatus !== 'received';
		}) ?? false
	);

	const hasAnyRounds = $derived(
		(groups.some((group) =>
			group.rounds.some((round) => round.date === cell.date)
			&& startOfDay(new Date(cell.date)) >= startOfDay(new Date())
		)) ?? false
	);
	const allDone = $derived(hasAnyRounds && !hasUnpaid && !hasUnreceived);
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
	{#if hasAnyRounds}
		<p class="mt-0.5 text-[9px] leading-tight {isNegative ? 'text-red-500 font-bold' : 'text-muted-foreground'}">
			{!allDone ? formatCurrency(projectedDayData?.balance ?? 0).replace('฿', '') : ''}
		</p>
		<div class="mt-1 flex gap-0.5">
			{#if hasUnpaid}
				<span class="h-1.5 w-1.5 rounded-full bg-red-400"></span>
			{/if}
			{#if hasUnreceived}
				<span class="h-1.5 w-1.5 rounded-full bg-green-400"></span>
			{/if}
			{#if allDone}
				<span class="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
			{/if}
		</div>
	{/if}
</button>
