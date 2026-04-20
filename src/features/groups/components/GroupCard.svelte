<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import { formatCurrency, formatDate, iOweForRound } from '$lib/utils/calculator';
	import type { Group } from '$features/groups/types';

	interface Props {
		group: Group;
		onclick: () => void;
		isActive?: boolean;
	}

	let { group, onclick, isActive = true }: Props = $props();

	function paidCount() {
		return group.rounds.filter((r) => r.status === 'paid').length;
	}

	function nextRound() {
		return group.rounds.find((r) => r.status !== 'paid');
	}

	const paid = $derived(paidCount());
	const total = $derived(group.rounds.length);
	const next = $derived(nextRound());
	const owe = $derived(iOweForRound(group));
</script>

<button
	type="button"
	{onclick}
	class="w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:shadow-md {!isActive ? 'opacity-70 hover:opacity-100' : ''}"
>
	<div class="mb-3 flex items-start justify-between">
		<div>
			<p class="font-semibold">{group.name}</p>
			<p class="text-xs text-muted-foreground">
				{total} มือ · มือเรา: {group.rounds.filter((r) => r.isMyRound).map((r) => r.roundNumber).join(', ')}
			</p>
		</div>
		{#if !isActive}
			<Badge variant="outline" class="text-xs">ปิดแล้ว</Badge>
		{:else}
			<p class="text-xs text-muted-foreground">{paid}/{total}</p>
		{/if}
	</div>

	<Progress value={(paid / total) * 100} class="mb-2 h-1.5" />

	<div class="flex items-center justify-between text-xs text-muted-foreground">
		{#if isActive && next}
			<span>{formatDate(next.date)}</span>
			<span class="{next.isMyRound ? 'text-green-600' : 'text-red-500'} font-medium">
				{next.isMyRound ? `รับ ${formatCurrency(next.receiveAmount)}` : `จ่าย ${formatCurrency(owe)}`}
			</span>
		{:else if !isActive}
			<span class="text-muted-foreground">ปิดแล้ว</span>
		{:else}
			<span class="text-green-600">เสร็จสิ้น</span>
		{/if}
	</div>
</button>
