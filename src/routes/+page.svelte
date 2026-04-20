<script lang="ts">
	import { goto } from '$app/navigation';
	import { groupsStore } from '$features/groups/stores/groups.svelte';
	import { walletStore } from '$features/wallet/stores/wallet.svelte';
	import { formatCurrency, formatDate, nextRoundOwe } from '$lib/utils/calculator';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import * as Sheet from '$lib/components/ui/sheet';
	import { ChevronDown, ChevronUp, CirclePlus, TrendingDown, TrendingUp, Users } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { useDashboard } from '$features/dashboard/composables/useDashboard.svelte';

	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth();

	const dashboard = useDashboard(
		() => groupsStore.groups,
		() => walletStore.wallet,
		year,
		month
	);

	import type { Round } from '$features/groups/types';

	let selectedPayment: {
		group: (typeof dashboard.activeGroups)[number];
		round: Round;
		daysUntil: number;
		owe: number;
		payout: Round | null;
	} | null = $state(null);
	let paymentSheetOpen = $state(false);
	let collapsedGroups = $state<string[]>([]);

	function thaiDateToday() {
		return new Intl.DateTimeFormat('th-TH', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(new Date());
	}

	function toggleGroupCollapse(groupId: string) {
		if (collapsedGroups.includes(groupId)) {
			collapsedGroups = collapsedGroups.filter((id) => id !== groupId);
		} else {
			collapsedGroups = [...collapsedGroups, groupId];
		}
	}

	function paidCount(group: (typeof dashboard.activeGroups)[0]) {
		return group.rounds.filter((r) => r.status === 'paid').length;
	}

	const groupSummaries = $derived(
		dashboard.activeGroups
			.map((group) => {
				const owe = nextRoundOwe(group);
				const paymentMap = new Map(
					dashboard.upcomingPayments
						.filter((p) => p.group.id === group.id)
						.map((p) => [p.round.roundNumber, p])
				);
				const payoutMap = new Map(
					dashboard.upcomingPayouts
						.filter((p) => p.group.id === group.id)
						.map((p) => [p.round.roundNumber, p])
				);
				const roundNumbers = [...new Set([...paymentMap.keys(), ...payoutMap.keys()])].sort(
					(a, b) => a - b
				);
				const rounds = roundNumbers.map((n) => ({
					roundNumber: n,
					payment: paymentMap.get(n) ?? null,
					payout: payoutMap.get(n) ?? null
				}));
				const hasOverdue = rounds.some((r) => r.payment && r.payment.daysUntil < 0);
				return { group, owe, rounds, hasOverdue };
			})
			.filter((s) => s.rounds.length > 0)
	);

	function markAsPaid(groupId: string, roundNumber: number) {
		groupsStore.markRoundPaid(groupId, roundNumber);
		toast.success('จ่ายเงินเรียบร้อย');
		paymentSheetOpen = false;
		setTimeout(() => {
			selectedPayment = null;
		}, 300);
	}

	function markAsReceived(groupId: string, roundNumber: number) {
		groupsStore.markRoundReceived(groupId, roundNumber);
		toast.success('รับเงินเรียบร้อย');
		paymentSheetOpen = false;
		setTimeout(() => {
			selectedPayment = null;
		}, 300);
	}
</script>

<div class="space-y-4 p-4">
	<header class="pt-2">
		<h5 class="flex items-center gap-2 text-xl font-bold">
			<TrendingDown class="h-4 w-4 text-red-500" />
			สิ่งที่ต้องทำ
		</h5>
		<p class="text-xs text-muted-foreground">{thaiDateToday()}</p>
	</header>

	{#if dashboard.activeGroups.length === 0}
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
		<!-- Upcoming by group -->
		<div>
			{#if groupSummaries.length === 0}
				<p class="py-2 text-sm text-muted-foreground">ไม่มีรายการในช่วงนี้ 🎉</p>
			{:else}
				<div class="space-y-4">
					{#each groupSummaries as { group, owe, rounds, hasOverdue } (group.id)}
						{@const isCollapsed = collapsedGroups.includes(group.id)}
						<div
							class="rounded-xl border {hasOverdue
								? 'border-red-300 dark:border-red-900'
								: 'border-border'} overflow-hidden"
						>
							<button
								type="button"
								onclick={() => toggleGroupCollapse(group.id)}
								class="flex w-full items-center justify-between px-3 py-2 {hasOverdue
									? 'bg-red-50 dark:bg-red-950/20'
									: 'bg-muted/40'} transition-colors hover:bg-muted/60"
							>
								<div class="flex items-center gap-2">
									<p class="text-sm font-semibold">{group.name}</p>
									{#if hasOverdue}
										<Badge variant="destructive" class="text-xs">เกินกำหนด</Badge>
									{/if}
								</div>
								{#if isCollapsed}
									<ChevronDown class="h-4 w-4 text-muted-foreground transition-transform duration-200" />
								{:else}
									<ChevronUp class="h-4 w-4 text-muted-foreground transition-transform duration-200" />
								{/if}
							</button>
							<div class="overflow-hidden transition-all duration-300 ease-in-out" style:max-height="{isCollapsed ? '0' : '1000px'}">
								<div class="divide-y divide-border">
								{#each rounds as { roundNumber, payment, payout } (roundNumber)}
									{@const hasPayment = payment !== null}
									{@const hasPayout = payout !== null}
									{@const isOverdue = payment && payment.daysUntil < 0}
									{@const isToday = payment && payment.daysUntil === 0}
									{@const payAmount = payment?.round.paymentAmount ?? owe}
									{@const netAmount = hasPayout && hasPayment
										? payout.round.receiveAmount - payAmount
										: hasPayout
											? payout.round.receiveAmount
											: hasPayment
												? -payAmount
												: 0}
									{@const isPositive = netAmount >= 0}
									<button
										type="button"
										onclick={() => {
											selectedPayment = {
												group,
												round: payment?.round ?? payout!.round,
												daysUntil: payment?.daysUntil ?? 0,
												owe,
												payout: payout?.round ?? null
											};
											paymentSheetOpen = true;
										}}
										class="flex w-full items-center justify-between px-3 py-2 text-left transition-colors {isPositive
											? 'bg-green-50/50 hover:bg-green-100/50 dark:bg-green-950/10 dark:hover:bg-green-950/20'
											: 'hover:bg-muted/50'}"
									>
										<div class="flex items-center gap-2">
											{#if isPositive}
												<TrendingUp class="h-3 w-3 shrink-0 text-green-500" />
											{:else}
												<TrendingDown class="h-3 w-3 shrink-0 text-red-400" />
											{/if}
											<p class="text-xs font-medium">
												มือ {roundNumber} · {formatDate(payment?.round.date ?? payout!.round.date)}
											</p>
										</div>
										<div class="flex items-center gap-2">
											<p class="text-sm font-bold {isPositive
												? 'text-green-600 dark:text-green-400'
												: 'text-red-500'}">
												{isPositive ? '+' : '-'}{formatCurrency(Math.abs(netAmount))}
											</p>
											{#if isOverdue}
												<Badge variant="destructive" class="text-xs">เกิน</Badge>
											{:else if isToday}
												<Badge class="bg-orange-500 text-xs text-white">วันนี้</Badge>
											{:else if payment}
												<p class="text-xs text-muted-foreground">อีก {payment.daysUntil} วัน</p>
											{/if}
										</div>
									</button>
								{/each}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

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
				{#if dashboard.activeGroups.length === 0}
					<p class="py-2 text-sm text-muted-foreground">ไม่มีวงที่กำลังดำเนิน</p>
				{:else}
					<div class="space-y-3">
						{#each dashboard.activeGroups as group (group.id)}
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
										{next.isMyRound ? `รับ ${formatCurrency(next.receiveAmount)}` : `จ่าย`}
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
<Sheet.Root
	open={paymentSheetOpen}
	onOpenChange={(o) => {
		if (!o) {
			paymentSheetOpen = false;
			setTimeout(() => {
				selectedPayment = null;
			}, 300);
		}
	}}
>
	<Sheet.Content side="bottom" class="max-h-[60vh] rounded-t-2xl">
		<Sheet.Header>
			<Sheet.Title>
				{#if selectedPayment}
					{selectedPayment.group.name} - มือ {selectedPayment.round.roundNumber}
				{/if}
			</Sheet.Title>
		</Sheet.Header>

		{#if selectedPayment}
			{@const isPaymentDay = selectedPayment.round.status !== 'paid'}
			{@const isPayoutDay = selectedPayment.payout && selectedPayment.payout.payoutStatus !== 'received'}
			{@const netAmount = isPayoutDay && isPaymentDay
				? selectedPayment.payout!.receiveAmount - selectedPayment.owe
				: isPayoutDay
					? selectedPayment.payout!.receiveAmount
					: isPaymentDay
						? -selectedPayment.owe
						: 0}
			{@const isPositive = netAmount >= 0}
			<div class="mt-4 space-y-4 px-4 pb-4">
				<!-- Net Summary -->
				<div class="flex items-center justify-between rounded-lg {isPositive
					? 'bg-green-50 dark:bg-green-950/20'
					: 'bg-red-50 dark:bg-red-950/20'} p-4">
					<div>
						<p class="text-sm text-muted-foreground">ยอดสุทธิ</p>
						<p class="text-2xl font-bold {isPositive
							? 'text-green-600 dark:text-green-400'
							: 'text-red-500'}">
							{isPositive ? '+' : '-'}{formatCurrency(Math.abs(netAmount))}
						</p>
					</div>
					<div class="text-right">
						<p class="text-sm text-muted-foreground">วันที่</p>
						<p class="font-medium">{formatDate(selectedPayment.round.date)}</p>
					</div>
				</div>

				<!-- Details -->
				{#if isPaymentDay}
					<div class="flex items-center justify-between rounded-lg bg-muted/50 p-3">
						<div class="flex items-center gap-2">
							<TrendingDown class="h-4 w-4 text-red-400" />
							<p class="text-sm text-muted-foreground">จ่าย</p>
						</div>
						<p class="text-lg font-bold text-red-500">-{formatCurrency(selectedPayment.owe)}</p>
					</div>
				{/if}

				{#if isPayoutDay}
					<div class="flex items-center justify-between rounded-lg bg-green-50 dark:bg-green-950/20 p-3">
						<div class="flex items-center gap-2">
							<TrendingUp class="h-4 w-4 text-green-500" />
							<p class="text-sm text-muted-foreground">รับ</p>
						</div>
						<p class="text-lg font-bold text-green-600 dark:text-green-400">
							+{formatCurrency(selectedPayment.payout!.receiveAmount)}
						</p>
					</div>
				{/if}

				{#if selectedPayment.daysUntil < 0}
					<div
						class="flex items-center justify-center gap-2 rounded-lg bg-red-50 p-3 dark:bg-red-950/20"
					>
						<Badge variant="destructive">เกินกำหนด</Badge>
						<p class="text-sm text-red-600 dark:text-red-400">
							เกินกำหนด {Math.abs(selectedPayment.daysUntil)} วัน
						</p>
					</div>
				{:else if selectedPayment.daysUntil === 0}
					<div
						class="flex items-center justify-center gap-2 rounded-lg bg-orange-50 p-3 dark:bg-orange-950/20"
					>
						<Badge class="bg-orange-500 text-white">วันนี้</Badge>
						<p class="text-sm text-orange-600 dark:text-orange-400">ถึงกำหนดวันนี้</p>
					</div>
				{:else}
					<div class="flex items-center justify-center gap-2 rounded-lg bg-muted/50 p-3">
						<Badge variant="outline">กำหนด</Badge>
						<p class="text-sm text-muted-foreground">อีก {selectedPayment.daysUntil} วัน</p>
					</div>
				{/if}

				<div class="space-y-2">
					{#if isPaymentDay}
						<Button
							onclick={() =>
								selectedPayment &&
								markAsPaid(selectedPayment.group.id, selectedPayment.round.roundNumber)}
							class="w-full"
							size="lg"
						>
							จ่ายเงิน
						</Button>
					{/if}
					{#if isPayoutDay}
						<Button
							onclick={() =>
								selectedPayment &&
								selectedPayment.payout &&
								markAsReceived(selectedPayment.group.id, selectedPayment.payout.roundNumber)}
							class="w-full"
							size="lg"
							variant="outline"
						>
							รับเงิน
						</Button>
					{/if}
				</div>
			</div>
		{/if}
	</Sheet.Content>
</Sheet.Root>
