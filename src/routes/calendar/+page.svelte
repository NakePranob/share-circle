<script lang="ts">
	import { groupsStore } from '$lib/stores/groups.svelte';
	import { walletStore } from '$lib/stores/wallet.svelte';
	import { buildCashFlow, buildPaidCashFlow } from '$lib/utils/cashflow';
	import { formatCurrency } from '$lib/utils/calculator';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Sheet from '$lib/components/ui/sheet';
	import { toast } from 'svelte-sonner';
	import { ChevronLeft, ChevronRight, Wallet, Plus, Minus } from '@lucide/svelte';
	import type { DayData } from '$lib/types';

	const groups = $derived(groupsStore.groups);
	const wallet = $derived(walletStore.wallet);

	let viewYear = $state(new Date().getFullYear());
	let viewMonth = $state(new Date().getMonth()); // 0-indexed

	const cashFlow = $derived(buildCashFlow(groups, wallet, viewYear, viewMonth));
	const paidCashFlow = $derived(buildPaidCashFlow(groups, wallet, viewYear, viewMonth));

	const calendarDays = $derived.by(() => {
		const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
		const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
		const cells: Array<{ date: string; day: number } | null> = [];

		for (let i = 0; i < firstDay; i++) cells.push(null);
		for (let d = 1; d <= daysInMonth; d++) {
			const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
			cells.push({ date: dateStr, day: d });
		}
		return cells;
	});

	const monthLabel = $derived(
		new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(
			new Date(viewYear, viewMonth, 1)
		)
	);

	const todayStr = new Date().toISOString().split('T')[0];

	// Wallet dialogs
	let showBalanceDialog = $state(false);
	let showDepositDialog = $state(false);
	let showWithdrawDialog = $state(false);
	let balanceInput = $state(walletStore.wallet.initialBalance);
	let txnAmount = $state(0);
	let txnNote = $state('');

	// Day sheet
	let selectedDay = $state<DayData | null>(null);

	function prevMonth() {
		if (viewMonth === 0) {
			viewMonth = 11;
			viewYear--;
		} else {
			viewMonth--;
		}
	}

	function nextMonth() {
		if (viewMonth === 11) {
			viewMonth = 0;
			viewYear++;
		} else {
			viewMonth++;
		}
	}

	function saveBalance() {
		walletStore.setInitialBalance(balanceInput);
		toast.success('ตั้งทุนเรียบร้อย');
		showBalanceDialog = false;
	}

	function deposit() {
		if (txnAmount <= 0) return;
		walletStore.addTransaction('deposit', txnAmount, txnNote);
		toast.success('เติมเงินเรียบร้อย');
		showDepositDialog = false;
		txnAmount = 0;
		txnNote = '';
	}

	function withdraw() {
		if (txnAmount <= 0) return;
		walletStore.addTransaction('withdrawal', txnAmount, txnNote);
		toast.success('เบิกเงินเรียบร้อย');
		showWithdrawDialog = false;
		txnAmount = 0;
		txnNote = '';
	}

	function clickDay(dateStr: string) {
		const data = cashFlow.get(dateStr);
		if (data) selectedDay = data;
	}

	function txnLabel(type: string) {
		if (type === 'payment') return '💸 จ่าย';
		if (type === 'payout') return '💰 รับ';
		if (type === 'deposit') return '➕ เติม';
		if (type === 'withdrawal') return '➖ เบิก';
		return type;
	}

	function currentBalance() {
		const todayData = paidCashFlow.get(todayStr);
		return todayData?.balance ?? wallet.initialBalance;
	}
</script>

<div class="p-4">
	<header class="mb-4">
		<h1 class="text-xl font-bold">ปฏิทินกระแสเงิน</h1>
	</header>

	<!-- Wallet card -->
	<Card class="mb-4">
		<CardHeader class="pb-2">
			<CardTitle class="flex items-center gap-2 text-base">
				<Wallet class="h-4 w-4" />
				กระเป๋าเงิน
			</CardTitle>
		</CardHeader>
		<CardContent>
			<p class="mb-3 text-3xl font-bold {currentBalance() < 0 ? 'text-red-500' : ''}">
				{formatCurrency(currentBalance())}
			</p>
			<div class="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					onclick={() => { balanceInput = wallet.initialBalance; showBalanceDialog = true; }}
					class="flex-1"
				>
					ตั้งทุน
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={() => { txnAmount = 0; txnNote = ''; showDepositDialog = true; }}
					class="flex-1"
				>
					<Plus class="mr-1 h-3 w-3" />
					เติม
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={() => { txnAmount = 0; txnNote = ''; showWithdrawDialog = true; }}
					class="flex-1"
				>
					<Minus class="mr-1 h-3 w-3" />
					เบิก
				</Button>
			</div>
		</CardContent>
	</Card>

	<!-- Month navigation -->
	<div class="mb-3 flex items-center justify-between">
		<button onclick={prevMonth} class="rounded-full p-2 hover:bg-muted">
			<ChevronLeft class="h-5 w-5" />
		</button>
		<span class="font-semibold">{monthLabel}</span>
		<button onclick={nextMonth} class="rounded-full p-2 hover:bg-muted">
			<ChevronRight class="h-5 w-5" />
		</button>
	</div>

	<!-- Calendar grid -->
	<div class="rounded-xl border border-border overflow-hidden">
		<!-- Day headers -->
		<div class="grid grid-cols-7 bg-muted/50">
			{#each ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'] as dayName}
				<div class="py-2 text-center text-xs font-medium text-muted-foreground">{dayName}</div>
			{/each}
		</div>

		<!-- Day cells -->
		<div class="grid grid-cols-7">
			{#each calendarDays as cell}
				{#if cell === null}
					<div class="min-h-16 border-b border-r border-border bg-muted/20 last:border-r-0"></div>
				{:else}
					{@const dayData = cashFlow.get(cell.date)}
					{@const isToday = cell.date === todayStr}
					{@const hasPayments = dayData?.transactions.some((t) => t.transaction.type === 'payment' || t.transaction.type === 'withdrawal') ?? false}
					{@const hasPayouts = dayData?.transactions.some((t) => t.transaction.type === 'payout' || t.transaction.type === 'deposit') ?? false}
					{@const hasEstimates = dayData?.transactions.some((t) => t.transaction.isEstimate) ?? false}
					{@const isNegative = dayData?.hasNegativeBalance ?? false}
					<button
						onclick={() => clickDay(cell.date)}
						class="relative min-h-16 border-b border-r border-border p-1 text-left transition-colors last:border-r-0 hover:bg-muted/50 {isToday ? 'bg-primary/5' : ''}"
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
							</div>
						{/if}
					</button>
				{/if}
			{/each}
		</div>
	</div>

	<div class="mt-3 flex gap-4 text-xs text-muted-foreground">
		<div class="flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-red-400"></span> จ่าย</div>
		<div class="flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-green-400"></span> รับ</div>
		<div class="flex items-center gap-1"><span class="text-red-500 font-bold">สีแดง</span> = ยอดติดลบ</div>
	</div>
</div>

<!-- Day detail sheet -->
<Sheet.Root open={selectedDay !== null} onOpenChange={(o) => !o && (selectedDay = null)}>
	<Sheet.Content side="bottom" class="max-h-[60vh]">
		<Sheet.Header>
			<Sheet.Title>
				{#if selectedDay}
					{new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(selectedDay.date))}
				{/if}
			</Sheet.Title>
		</Sheet.Header>

		{#if selectedDay}
			<div class="mt-4 space-y-2 overflow-y-auto pb-8">
				<div class="mb-4 flex items-center justify-between rounded-lg bg-muted/50 p-3">
					<span class="text-sm">ยอดคงเหลือ</span>
					<span class="font-bold {selectedDay.hasNegativeBalance ? 'text-red-500' : 'text-green-600 dark:text-green-400'}">
						{formatCurrency(selectedDay.balance)}
					</span>
				</div>

				{#if selectedDay.transactions.length === 0}
					<p class="py-4 text-center text-sm text-muted-foreground">ไม่มีรายการในวันนี้</p>
				{:else}
					{#each selectedDay.transactions as { transaction, groupName }}
						<div class="flex items-center justify-between rounded-lg border border-border p-3">
							<div>
								<p class="text-sm font-medium">{txnLabel(transaction.type)}</p>
								<p class="text-xs text-muted-foreground">
									{transaction.note || groupName || '—'}
									{#if transaction.isEstimate}
										<span class="italic"> (ประมาณ)</span>
									{/if}
								</p>
							</div>
							<p class="font-medium {transaction.type === 'payment' || transaction.type === 'withdrawal' ? 'text-red-500' : 'text-green-600 dark:text-green-400'}">
								{transaction.type === 'payment' || transaction.type === 'withdrawal' ? '-' : '+'}
								{formatCurrency(transaction.amount)}
							</p>
						</div>
					{/each}
				{/if}
			</div>
		{/if}
	</Sheet.Content>
</Sheet.Root>

<!-- Set balance dialog -->
<Dialog.Root open={showBalanceDialog} onOpenChange={(o) => (showBalanceDialog = o)}>
	<Dialog.Content class="max-w-sm">
		<Dialog.Header>
			<Dialog.Title>ตั้งทุนเริ่มต้น</Dialog.Title>
		</Dialog.Header>
		<div class="space-y-3">
			<Label for="balance">ยอดเงิน (บาท)</Label>
			<Input id="balance" type="number" bind:value={balanceInput} />
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showBalanceDialog = false)}>ยกเลิก</Button>
			<Button onclick={saveBalance}>บันทึก</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Deposit dialog -->
<Dialog.Root open={showDepositDialog} onOpenChange={(o) => (showDepositDialog = o)}>
	<Dialog.Content class="max-w-sm">
		<Dialog.Header>
			<Dialog.Title>เติมเงิน</Dialog.Title>
		</Dialog.Header>
		<div class="space-y-3">
			<div class="space-y-2">
				<Label for="deposit-amount">จำนวน (บาท)</Label>
				<Input id="deposit-amount" type="number" min="1" bind:value={txnAmount} />
			</div>
			<div class="space-y-2">
				<Label for="deposit-note">หมายเหตุ (ไม่บังคับ)</Label>
				<Input id="deposit-note" bind:value={txnNote} placeholder="เช่น โบนัส" />
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showDepositDialog = false)}>ยกเลิก</Button>
			<Button onclick={deposit} disabled={txnAmount <= 0}>เติม</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Withdraw dialog -->
<Dialog.Root open={showWithdrawDialog} onOpenChange={(o) => (showWithdrawDialog = o)}>
	<Dialog.Content class="max-w-sm">
		<Dialog.Header>
			<Dialog.Title>เบิกเงิน</Dialog.Title>
		</Dialog.Header>
		<div class="space-y-3">
			<div class="space-y-2">
				<Label for="withdraw-amount">จำนวน (บาท)</Label>
				<Input id="withdraw-amount" type="number" min="1" bind:value={txnAmount} />
			</div>
			<div class="space-y-2">
				<Label for="withdraw-note">หมายเหตุ (ไม่บังคับ)</Label>
				<Input id="withdraw-note" bind:value={txnNote} placeholder="เช่น ค่าใช้จ่าย" />
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showWithdrawDialog = false)}>ยกเลิก</Button>
			<Button onclick={withdraw} disabled={txnAmount <= 0} variant="destructive">เบิก</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
