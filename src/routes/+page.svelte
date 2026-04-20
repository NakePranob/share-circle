<script lang="ts">
	import { goto } from '$app/navigation';
	import { groupsStore } from '$lib/stores/groups.svelte';
	import { getUpcomingPayments, getUpcomingPayouts } from '$lib/utils/cashflow';
	import { formatCurrency, formatDate } from '$lib/utils/calculator';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import * as Sheet from '$lib/components/ui/sheet';
	import { CirclePlus, TrendingDown, TrendingUp, Users } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	const groups = $derived(groupsStore.groups);
	const activeGroups = $derived(groups.filter((g) => g.isActive));
	const upcomingPayments = $derived(getUpcomingPayments(groups));
	const upcomingPayouts = $derived(getUpcomingPayouts(groups));

	let selectedPayment: { group: typeof groups[number]; round: typeof groups[number]['rounds'][number]; daysUntil: number; owe: number } | null = $state(null);

	function thaiDateToday() {
		return new Intl.DateTimeFormat('th-TH', {
			weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
		}).format(new Date());
	}

	function paidCount(group: (typeof groups)[0]) {
		return group.rounds.filter((r) => r.status === 'paid').length;
	}

	function markAsPaid(groupId: string, roundNumber: number) {
		groupsStore.markRoundPaid(groupId, roundNumber);
		toast.success('จ่ายเงินเรียบร้อย');
		selectedPayment = null;
	}
</script>

<div class="space-y-4 p-4">
	<header class="pt-2">
		<p class="text-xs text-muted-foreground">{thaiDateToday()}</p>
		<h1 class="text-2xl font-bold">สวัสดี 👋</h1>
	</header>

	{#if groups.length === 0}
		<div class="flex flex-col items-center justify-center py-16 text-center">
			<Users class="mb-4 h-16 w-16 text-muted-foreground/40" />
			<h2 class="mb-2 text-lg font-semibold">ยังไม่มีวงแชร์</h2>
			<p class="mb-6 text-sm text-muted-foreground">สร้างวงแชร์แรกของคุณเพื่อเริ่มต้น</p>
			<Button onclick={() => goto('/groups/new')}>
				<CirclePlus class="mr-2 h-4 w-4" />
				สร้างวงแรก
			</Button>
		</div>
	{:else}
		<!-- Upcoming payments -->
		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="flex items-center gap-2 text-base">
					<TrendingDown class="h-4 w-4 text-red-500" />
					ต้องจ่าย (7 วันข้างหน้า)
				</CardTitle>
			</CardHeader>
			<CardContent>
				{#if upcomingPayments.length === 0}
					<p class="py-2 text-sm text-muted-foreground">ไม่มีรายการจ่ายในช่วงนี้ 🎉</p>
				{:else}
					<div class="space-y-2">
						{#each upcomingPayments as { group, round, daysUntil, owe }}
							{@const isOverdue = daysUntil < 0}
							{@const isToday = daysUntil === 0}
							<button
								onclick={() => selectedPayment = { group, round, daysUntil, owe }}
								class="w-full flex items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 {isOverdue ? 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/20' : 'border-border'}"
							>
								<div>
									<p class="text-sm font-medium">{group.name}</p>
									<p class="text-xs text-muted-foreground">
										มือ {round.roundNumber} · {formatDate(round.date)}
									</p>
								</div>
								<div class="flex flex-col items-end gap-2">
									<p class="text-sm font-bold text-red-500">{formatCurrency(owe)}</p>
									{#if isOverdue}
										<Badge variant="destructive" class="text-xs">เกินกำหนด</Badge>
									{:else if isToday}
										<Badge class="bg-orange-500 text-xs text-white">วันนี้</Badge>
									{:else}
										<p class="text-xs text-muted-foreground">อีก {daysUntil} วัน</p>
									{/if}
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Upcoming payouts -->
		{#if upcomingPayouts.length > 0}
			<Card>
				<CardHeader class="pb-2">
					<CardTitle class="flex items-center gap-2 text-base">
						<TrendingUp class="h-4 w-4 text-green-500" />
						จะได้รับเงิน
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="space-y-2">
						{#each upcomingPayouts as { group, round }}
							<div class="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/20">
								<div>
									<p class="text-sm font-medium">{group.name}</p>
									<p class="text-xs text-muted-foreground">มือ {round.roundNumber} · {formatDate(round.date)}</p>
								</div>
								<p class="text-sm font-bold text-green-600 dark:text-green-400">
									+{formatCurrency(round.receiveAmount)}
								</p>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>
		{/if}

		<!-- Active groups -->
		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="flex items-center justify-between text-base">
					<span class="flex items-center gap-2">
						<Users class="h-4 w-4" />
						วงที่กำลังดำเนิน
					</span>
					<Button variant="ghost" size="sm" onclick={() => goto('/groups')}>ดูทั้งหมด</Button>
				</CardTitle>
			</CardHeader>
			<CardContent>
				{#if activeGroups.length === 0}
					<p class="py-2 text-sm text-muted-foreground">ไม่มีวงที่กำลังดำเนิน</p>
				{:else}
					<div class="space-y-3">
						{#each activeGroups as group}
							{@const paid = paidCount(group)}
							{@const total = group.rounds.length}
							{@const next = group.rounds.find((r) => r.status !== 'paid')}
							<button
								onclick={() => goto(`/groups/${group.id}`)}
								class="w-full rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/50"
							>
								<div class="mb-2 flex items-center justify-between">
									<p class="font-medium">{group.name}</p>
									<p class="text-xs text-muted-foreground">{paid}/{total} มือ</p>
								</div>
								<Progress value={(paid / total) * 100} class="mb-1 h-1.5" />
								{#if next}
									<p class="text-xs text-muted-foreground">
										ถัดไป: {formatDate(next.date)} ·
										{next.isMyRound
											? `รับ ${formatCurrency(next.receiveAmount)}`
											: `จ่าย`}
									</p>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>
	{/if}
</div>

<!-- Payment detail sheet -->
<Sheet.Root open={selectedPayment !== null} onOpenChange={(o) => !o && (selectedPayment = null)}>
	<Sheet.Content side="bottom" class="max-h-[60vh] rounded-t-2xl">
		<Sheet.Header>
			<Sheet.Title>
				{#if selectedPayment}
					{selectedPayment.group.name} - มือ {selectedPayment.round.roundNumber}
				{/if}
			</Sheet.Title>
		</Sheet.Header>

		{#if selectedPayment}
			<div class="mt-4 space-y-4 px-4 pb-4">
				<div class="flex items-center justify-between rounded-lg bg-muted/50 p-4">
					<div>
						<p class="text-sm text-muted-foreground">ยอดที่ต้องจ่าย</p>
						<p class="text-2xl font-bold text-red-500">{formatCurrency(selectedPayment.owe)}</p>
					</div>
					<div class="text-right">
						<p class="text-sm text-muted-foreground">วันที่</p>
						<p class="font-medium">{formatDate(selectedPayment.round.date)}</p>
					</div>
				</div>

				{#if selectedPayment.daysUntil < 0}
					<div class="flex items-center justify-center gap-2 rounded-lg bg-red-50 p-3 dark:bg-red-950/20">
						<Badge variant="destructive">เกินกำหนด</Badge>
						<p class="text-sm text-red-600 dark:text-red-400">เกินกำหนด {Math.abs(selectedPayment.daysUntil)} วัน</p>
					</div>
				{:else if selectedPayment.daysUntil === 0}
					<div class="flex items-center justify-center gap-2 rounded-lg bg-orange-50 p-3 dark:bg-orange-950/20">
						<Badge class="bg-orange-500 text-white">วันนี้</Badge>
						<p class="text-sm text-orange-600 dark:text-orange-400">ถึงกำหนดวันนี้</p>
					</div>
				{:else}
					<div class="flex items-center justify-center gap-2 rounded-lg bg-muted/50 p-3">
						<Badge variant="outline">กำหนด</Badge>
						<p class="text-sm text-muted-foreground">อีก {selectedPayment.daysUntil} วัน</p>
					</div>
				{/if}

				<Button
					onclick={() => selectedPayment && markAsPaid(selectedPayment.group.id, selectedPayment.round.roundNumber)}
					class="w-full"
					size="lg"
				>
					จ่ายเงิน
				</Button>
			</div>
		{/if}
	</Sheet.Content>
</Sheet.Root>
