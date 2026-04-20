<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { CircleCheck, Circle, Pencil } from '@lucide/svelte';
	import { formatCurrency, formatDate } from '$lib/utils/calculator';
	import type { Group, Round } from '$features/shared/types';

	interface Props {
		group: Group;
		owe: number;
		onEditRound: (round: Round) => void;
		onMarkPaid: (roundNumber: number) => void;
		onMarkPending: (roundNumber: number) => void;
	}

	let { group, owe, onEditRound, onMarkPaid, onMarkPending }: Props = $props();
</script>

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
				<button
					type="button"
					onclick={() => onEditRound(round)}
					class="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
				>
					<Pencil class="h-3.5 w-3.5" />
				</button>
			</div>

			<div class="mb-3 flex items-center justify-between text-sm">
				{#if round.isMyRound}
					<div>
						<p class="text-xs text-muted-foreground">เราได้รับ</p>
						<p class="font-bold text-green-600 dark:text-green-400">{formatCurrency(round.receiveAmount)}</p>
					</div>
				{:else}
					<div>
						<p class="text-xs text-muted-foreground">เราจ่าย</p>
						<p class="font-bold text-red-500">{formatCurrency(owe)}</p>
					</div>
					<div class="text-right">
						<p class="text-xs text-muted-foreground">ยอดรับของมือนี้</p>
						<p class="text-sm text-muted-foreground">{formatCurrency(round.receiveAmount)}</p>
					</div>
				{/if}
			</div>

			{#if round.status === 'pending'}
				<Button
					size="sm"
					onclick={() => onMarkPaid(round.roundNumber)}
					class="w-full {round.isMyRound ? 'bg-green-600 hover:bg-green-700 text-white' : ''}"
					variant={round.isMyRound ? 'default' : 'outline'}
				>
					<CircleCheck class="mr-1 h-3 w-3" />
					{round.isMyRound ? 'รับแล้ว' : 'จ่ายแล้ว'}
				</Button>
			{:else}
				<button
					type="button"
					onclick={() => onMarkPending(round.roundNumber)}
					class="w-full rounded-md py-1 text-xs text-muted-foreground hover:text-foreground"
				>
					↩ ย้อนกลับ
				</button>
			{/if}
		</div>
	{/each}
</div>
