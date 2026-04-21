<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';
	import type { DayData } from '$features/calendar/types';
	import type { Group } from '$features/groups/types';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import DayCell from './DayCell.svelte';

	interface Props {
		calendarDays: Array<{ date: string; day: number } | null>;
		monthLabel: string;
		projectedCashFlow: Map<string, DayData>;
		groups: Group[];
		todayStr: string;
		onPrevMonth: () => void;
		onNextMonth: () => void;
		onClickDay: (date: string) => void;
	}

	let { calendarDays, monthLabel, projectedCashFlow, groups, todayStr, onPrevMonth, onNextMonth, onClickDay }: Props = $props();
</script>

<div class="mb-3 flex items-center justify-between">
	<button type="button" onclick={onPrevMonth} class="rounded-full p-2 hover:bg-muted">
		<ChevronLeft class="h-5 w-5" />
	</button>
	<span class="font-semibold">{monthLabel}</span>
	<button type="button" onclick={onNextMonth} class="rounded-full p-2 hover:bg-muted">
		<ChevronRight class="h-5 w-5" />
	</button>
</div>

<div class="rounded-xl border border-border overflow-hidden">
	<div class="grid grid-cols-7 bg-muted/50">
		{#each ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'] as dayName (dayName)}
			<div class="py-2 text-center text-xs font-medium text-muted-foreground">{dayName}</div>
		{/each}
	</div>

	<div class="grid grid-cols-7 border-t border-border">
		{#each calendarDays as cell, i (cell?.date || i)}
			{@const isSaturday = cell ? new SvelteDate(cell.date).getDay() === 6 : false}
			{@const currentRow = Math.floor(i / 7)}
			{@const lastRow = Math.floor((calendarDays.length - 1) / 7)}
			{@const isLastRow = currentRow === lastRow}
			{#if cell === null}
				<div
					class="min-h-16 border-b border-border bg-muted/20 {isLastRow ? 'border-b-0!' : ''} {!isSaturday ? 'border-r' : ''}"
				></div>
			{:else}
				<DayCell
					{cell}
					dayData={projectedCashFlow.get(cell.date)}
					projectedDayData={projectedCashFlow.get(cell.date)}
					{groups}
					isToday={cell.date === todayStr}
					{isLastRow}
					{isSaturday}
					onclick={() => onClickDay(cell.date)}
				/>
			{/if}
		{/each}
	</div>
</div>

<div class="mt-3 flex gap-4 text-xs text-muted-foreground">
	<div class="flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-red-400"></span> ต้องจ่าย</div>
	<div class="flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-green-400"></span> ต้องรับ</div>
	<div class="flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-gray-400"></span> เสร็จแล้ว</div>
	<div class="flex items-center gap-1"><span class="text-red-500 font-bold">สีแดง</span> = ยอดติดลบ</div>
</div>
