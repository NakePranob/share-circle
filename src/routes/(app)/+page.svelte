<script lang="ts">
	import { goto } from '$app/navigation';
	import { useGroupsStore } from '$features/groups/stores/groups.svelte';
	import { formatCurrency, formatDate, thaiDateToday } from '$features/shared/utils';

	const groupsStore = useGroupsStore();
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import * as Sheet from '$lib/components/ui/sheet';
	import {
		ChevronDown,
		ChevronUp,
		CirclePlus,
		TrendingDown,
		TrendingUp,
		Users
	} from '@lucide/svelte';
	import { useDashboard, useUpcomingRounds } from '$features/dashboard/composables';
	import { useGroupStats, useGroupActions } from '$features/groups/composables';
	const actions = useGroupActions();
	import { cn } from '$lib/utils';

	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth();

	const dashboard = useDashboard(year, month);
	const upcomingRounds = useUpcomingRounds();
	const { paidCount, nextRound, progress } = useGroupStats();

	// Check if data is loaded
	const dataLoaded = $derived(groupsStore.isLoaded);

	// Filter overdue rounds
	const overdueRounds = $derived(
		upcomingRounds.flatRounds.filter(
			({ payment, payout }) =>
				(payment && payment.daysUntil < 0) || (payout && payout.daysUntil < 0)
		)
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
	let listOpen = $state(true);

	async function markAsPaid(groupId: string, roundNumber: number) {
		await actions.markAsPaid(groupId, roundNumber);
		paymentSheetOpen = false;
		setTimeout(() => {
			selectedPayment = null;
		}, 300);
	}

	async function markAsReceived(groupId: string, roundNumber: number) {
		await actions.markAsReceived(groupId, roundNumber);
		paymentSheetOpen = false;
		setTimeout(() => {
			selectedPayment = null;
		}, 300);
	}

	async function markAllOverdueAsPaid() {
		const overduePayments = upcomingRounds.flatRounds.filter(
			({ payment }) => payment && payment.daysUntil < 0
		);
		for (const { group, roundNumber } of overduePayments) {
			await actions.markAsPaid(group.id, roundNumber);
		}
	}

	async function markAllOverdueAsReceived() {
		const overduePayouts = upcomingRounds.flatRounds.filter(
			({ payout }) => payout && payout.daysUntil < 0
		);
		for (const { group, payout } of overduePayouts) {
			if (payout) {
				await actions.markAsReceived(group.id, payout.round.roundNumber);
			}
		}
	}
</script>

<div class="space-y-4 p-4">
	<header class="pt-2">
		<h5 class="flex items-center gap-2 text-xl font-bold">
			<TrendingDown class="h-4 w-4 text-red-500" />
			กิจกรรม
		</h5>
		<p class="text-xs text-muted-foreground">{thaiDateToday()}</p>
	</header>

	{#if !dataLoaded}
		<div class="flex items-center justify-center py-16">
			<p class="text-sm text-muted-foreground">กำลังโหลด...</p>
		</div>
	{:else if dashboard.activeGroups.length === 0}
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
		<!-- Overdue rounds -->
		{#if overdueRounds.length > 0}
			<Card class="p-3 border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/10">
				<div class="flex items-center justify-between mb-3">
					<p class="text-sm font-semibold text-red-600 dark:text-red-400">
						เกินกำหนด ({overdueRounds.length})
					</p>
				</div>
				<div class="flex gap-2">
					<Button
						onclick={markAllOverdueAsPaid}
						class="flex-1"
						size="sm"
						variant="destructive"
					>
						จ่ายทั้งหมด
					</Button>
					<Button
						onclick={markAllOverdueAsReceived}
						class="flex-1"
						size="sm"
						variant="outline"
					>
						รับทั้งหมด
					</Button>
				</div>
			</Card>
		{/if}
		<!-- Upcoming flat list sorted by date -->
		<div>
			{#if upcomingRounds.flatRounds.length === 0}
				<p class="py-2 text-sm text-muted-foreground">ไม่มีรายการในช่วงนี้ 🎉</p>
			{:else}
				<Card class="gap-0 space-y-0 overflow-hidden p-0">
					<button
						type="button"
						onclick={() => (listOpen = !listOpen)}
						class="flex w-full items-center justify-between bg-muted/40 px-3 py-2 transition-colors hover:bg-muted/60"
					>
						<p class="text-sm font-semibold">รายการที่ใกล้ถึง</p>
						{#if listOpen}
							<ChevronUp class="h-4 w-4 text-muted-foreground" />
						{:else}
							<ChevronDown class="h-4 w-4 text-muted-foreground" />
						{/if}
					</button>
					<div
						class={cn('overflow-hidden p-0 transition-all duration-300 ease-in-out', {
							'max-h-0': !listOpen
						})}
					>
						<div class="divide-y divide-border">
							{#each upcomingRounds.flatRounds as { group, owe, roundNumber, payment, payout, date } (`${group.id}-${roundNumber}`)}
								{@const hasPayment = payment !== null}
								{@const hasPayout = payout !== null}
								{@const isOverdue = payment && payment.daysUntil < 0}
								{@const isToday = payment && payment.daysUntil === 0}
								{@const payAmount = payment?.round.paymentAmount ?? owe}
								{@const fee = payout?.round.managementFee ?? 0}
								{@const netAmount =
									hasPayout && hasPayment
										? payout.round.receiveAmount - fee - payAmount
										: hasPayout
											? payout.round.receiveAmount - fee
											: hasPayment
												? -payAmount
												: 0}
								{@const isPositive = netAmount >= 0}
								<button
									type="button"
									onclick={() => {
										selectedPayment = {
											group,
											round: payment?.round ??
												payout?.round ?? {
													roundNumber: 0,
													date: '',
													paymentAmount: 0,
													receiveAmount: 0,
													status: 'pending',
													payoutStatus: 'pending',
													isMyRound: false,
													managementFee: 0
												},
											daysUntil: payment?.daysUntil ?? 0,
											owe,
											payout: payout?.round ?? null
										};
										paymentSheetOpen = true;
									}}
									class="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors {isPositive
										? 'bg-green-50/50 hover:bg-green-100/50 dark:bg-green-950/10 dark:hover:bg-green-950/20'
										: 'hover:bg-muted/50'}"
								>
									<div class="flex items-center gap-2">
										{#if isPositive}
											<TrendingUp class="h-3 w-3 shrink-0 text-green-500" />
										{:else}
											<TrendingDown class="h-3 w-3 shrink-0 text-red-400" />
										{/if}
										<div>
											<p class="text-xs font-medium">{group.name} · มือ {roundNumber}</p>
											<p class="text-xs text-muted-foreground">{formatDate(date)}</p>
										</div>
									</div>
									<div class="flex items-center gap-2">
										<p
											class="text-sm font-bold {isPositive
												? 'text-green-600 dark:text-green-400'
												: 'text-red-500'}"
										>
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
				</Card>
			{/if}
		</div>

		<!-- Active groups -->
		<div class="flex items-center justify-between text-base">
			<b class="flex items-center gap-2">
				<Users class="h-4 w-4" />
				วงที่กำลังดำเนิน
			</b>
			<Button variant="outline" size="sm" onclick={() => goto('/groups')}>ดูทั้งหมด</Button>
		</div>
		<div>
			{#if dashboard.activeGroups.length === 0}
				<p class="py-2 text-sm text-muted-foreground">ไม่มีวงที่กำลังดำเนิน</p>
			{:else}
				<div class="space-y-3">
					{#each dashboard.activeGroups as group (group.id)}
						{@const paid = paidCount(group)}
						{@const total = group.rounds.length}
						{@const next = nextRound(group)}
						{@const progressValue = progress(group)}
						<Card
							onclick={() => goto(`/groups/${group.id}`)}
							class="w-full py-4 text-left transition-colors hover:bg-muted/50"
						>
							<CardContent class="">
								<div class="mb-2 flex items-center justify-between">
									<p class="font-medium">{group.name}</p>
									<p class="text-xs text-muted-foreground">{paid}/{total} มือ</p>
								</div>
								<Progress value={progressValue} class="mb-1 h-1.5" />
								{#if next}
									<p class="text-xs text-muted-foreground">
										ถัดไป: {formatDate(next.date)} ·
										{next.isMyRound ? `รับ ${formatCurrency(next.receiveAmount)}` : `จ่าย`}
									</p>
								{/if}
							</CardContent>
						</Card>
					{/each}
				</div>
			{/if}
		</div>
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
			{@const isPayoutDay =
				selectedPayment.payout && selectedPayment.payout.payoutStatus !== 'received'}
			{@const fee = selectedPayment.payout?.managementFee ?? 0}
			{@const netAmount =
				isPayoutDay && isPaymentDay
					? selectedPayment.payout!.receiveAmount - fee - selectedPayment.round.paymentAmount
					: isPayoutDay
						? selectedPayment.payout!.receiveAmount - fee
						: isPaymentDay
							? -selectedPayment.round.paymentAmount
							: 0}
			{@const isPositive = netAmount >= 0}
			<div class="mt-4 space-y-4 px-4 pb-4">
				<!-- Net Summary -->
				<div
					class="flex items-center justify-between rounded-lg {isPositive
						? 'bg-green-50 dark:bg-green-950/20'
						: 'bg-red-50 dark:bg-red-950/20'} p-4"
				>
					<div>
						<p class="text-sm text-muted-foreground">ยอดสุทธิ</p>
						<p
							class="text-2xl font-bold {isPositive
								? 'text-green-600 dark:text-green-400'
								: 'text-red-500'}"
						>
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
						<p class="text-lg font-bold text-red-500">
							-{formatCurrency(selectedPayment.round.paymentAmount)}
						</p>
					</div>
				{/if}

				{#if isPayoutDay}
					<div
						class="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-950/20"
					>
						<div class="flex items-center gap-2">
							<TrendingUp class="h-4 w-4 text-green-500" />
							<p class="text-sm text-muted-foreground">รับ</p>
						</div>
						<p class="text-lg font-bold text-green-600 dark:text-green-400">
							+{formatCurrency(selectedPayment.payout!.receiveAmount)}
						</p>
					</div>
					{#if selectedPayment.payout!.managementFee}
						<div
							class="flex items-center justify-between rounded-lg bg-orange-50 p-3 dark:bg-orange-950/20"
						>
							<p class="text-sm text-muted-foreground">ค่าดูแลวง</p>
							<p class="text-sm font-bold text-orange-500">
								-{formatCurrency(selectedPayment.payout!.managementFee)}
							</p>
						</div>
					{/if}
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
