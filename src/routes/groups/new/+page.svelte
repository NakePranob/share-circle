<script lang="ts">
	import { goto } from '$app/navigation';
	import { groupsStore } from '$lib/stores/groups.svelte';
	import { formatCurrency, formatDate, totalIOwe, totalIReceive, iOweForRound } from '$lib/utils/calculator';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { toast } from 'svelte-sonner';
	import { ArrowLeft } from '@lucide/svelte';

	interface RoundForm {
		date: string;
		paymentAmount: number;
		receiveAmount: number;
		isMyRound: boolean;
	}

	type PlayMode = 'fixed' | 'stepped';

	let groupName = $state('');
	let errors = $state<Record<string, string>>({});

	// Group settings
	let totalRounds = $state(10);
	let playMode = $state<PlayMode>('fixed');
	let frequency = $state(30); // days
	let receiveAmountPerRound = $state(50000);
	let startDate = $state(new Date().toISOString().split('T')[0]);

	// Fixed mode settings
	let fixedPaymentAmount = $state(1000);

	// Stepped mode settings
	let steppedPayments = $state<number[]>([]);

	// Round selection
	let selectedRounds = $state(new Set<number>());

	// Generate rounds based on settings
	const rounds = $derived<RoundForm[]>((() => {
		const result: RoundForm[] = [];
		
		for (let i = 0; i < totalRounds; i++) {
			const date = new Date(startDate);
			date.setDate(date.getDate() + (i * frequency));
			const dateStr = date.toISOString().split('T')[0];
			
			const paymentAmount = playMode === 'fixed' 
				? fixedPaymentAmount 
				: (steppedPayments[i] ?? 0);
			
			result.push({
				date: dateStr,
				paymentAmount,
				receiveAmount: receiveAmountPerRound,
				isMyRound: selectedRounds.has(i)
			});
		}
		
		return result;
	})());

	// Initialize stepped payments when switching to stepped mode
	$effect(() => {
		if (playMode === 'stepped' && steppedPayments.length !== totalRounds) {
			steppedPayments = Array.from({ length: totalRounds }, (_, i) => (i + 1) * 100);
		}
	});

	// Preview as Group-like object for calculations
	const previewRounds = $derived(
		rounds.map((r, i) => ({
			roundNumber: i + 1,
			date: r.date,
			paymentAmount: r.paymentAmount,
			receiveAmount: r.receiveAmount,
			status: 'pending' as const,
			isMyRound: r.isMyRound
		}))
	);

	const previewGroup = $derived({ id: '', name: '', rounds: previewRounds, createdAt: '', isActive: true });

	const myRoundNums = $derived(previewRounds.filter((r) => r.isMyRound).map((r) => r.roundNumber));
	const owePerRound = $derived(iOweForRound(previewGroup));
	const sumReceive = $derived(totalIReceive(previewGroup));
	const sumOwe = $derived(totalIOwe(previewGroup));

	function validate(): boolean {
		const errs: Record<string, string> = {};
		if (!groupName.trim()) errs.name = 'กรุณากรอกชื่อวง';
		if (totalRounds < 2) errs.rounds = 'ต้องมีอย่างน้อย 2 มือ';
		if (receiveAmountPerRound <= 0) errs.receiveAmount = 'ยอดรับต้องมากกว่า 0';
		if (playMode === 'fixed' && fixedPaymentAmount <= 0) errs.fixedPayment = 'ยอดจ่ายต้องมากกว่า 0';
		if (playMode === 'stepped' && steppedPayments.some(p => p <= 0)) errs.steppedPayments = 'ยอดจ่ายทุกมือต้องมากกว่า 0';
		if (selectedRounds.size === 0) errs.myRound = 'เลือกมือที่เราได้รับอย่างน้อย 1 มือ';
		errors = errs;
		return Object.keys(errs).length === 0;
	}

	function submit() {
		if (!validate()) return;
		groupsStore.add({
			name: groupName.trim(),
			rounds: previewRounds,
			isActive: true
		});
		toast.success('สร้างวงแชร์เรียบร้อย!');
		goto('/groups');
	}
</script>

<div class="p-4">
	<header class="mb-6 flex items-center gap-3">
		<button type="button" onclick={() => goto('/groups')} class="text-muted-foreground hover:text-foreground">
			<ArrowLeft class="h-5 w-5" />
		</button>
		<h1 class="text-xl font-bold">สร้างวงใหม่</h1>
	</header>

	<form onsubmit={(e) => { e.preventDefault(); submit(); }} class="space-y-6">

		<!-- Name -->
		<div class="space-y-2">
			<Label for="name">ชื่อวง</Label>
			<Input id="name" bind:value={groupName} placeholder="เช่น วงแชร์บ้าน 2569" />
			{#if errors.name}<p class="text-xs text-destructive">{errors.name}</p>{/if}
		</div>

		<Separator />

		<!-- Group Settings -->
		<div class="space-y-4">
			<p class="text-sm font-medium">การตั้งค่าวง</p>
			
			<div class="space-y-2">
				<Label for="startDate">วันเริ่มต้น</Label>
				<Input id="startDate" type="date" bind:value={startDate} />
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="totalRounds">จำนวนมือทั้งหมด</Label>
					<Input id="totalRounds" type="number" min="2" bind:value={totalRounds} class="text-center" />
				</div>
				<div class="space-y-2">
					<Label for="frequency">ความถี่ (วัน)</Label>
					<Input id="frequency" type="number" min="1" bind:value={frequency} class="text-center" />
				</div>
			</div>

			<div class="space-y-2">
				<Label for="receiveAmount">ยอดรับต่อมือ (บาท)</Label>
				<Input id="receiveAmount" type="number" min="1" bind:value={receiveAmountPerRound} />
				{#if errors.receiveAmount}<p class="text-xs text-destructive">{errors.receiveAmount}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label>รูปแบบการเล่น</Label>
				<RadioGroup.Root bind:value={playMode}>
					<div class="flex items-center space-x-2">
						<RadioGroup.Item value="fixed" id="fixed" />
						<Label for="fixed" class="font-normal cursor-pointer">แบบคงที่ - จ่ายเท่ากันทุกมือ</Label>
					</div>
					<div class="flex items-center space-x-2">
						<RadioGroup.Item value="stepped" id="stepped" />
						<Label for="stepped" class="font-normal cursor-pointer">แบบขั้นบันได - จ่ายไม่เท่ากัน</Label>
					</div>
				</RadioGroup.Root>
			</div>

			{#if playMode === 'fixed'}
				<div class="space-y-2">
					<Label for="fixedPayment">ยอดจ่ายต่อมือ (บาท)</Label>
					<Input id="fixedPayment" type="number" min="1" bind:value={fixedPaymentAmount} />
					{#if errors.fixedPayment}<p class="text-xs text-destructive">{errors.fixedPayment}</p>{/if}
				</div>
			{:else}
				<div class="space-y-2">
					<Label>ยอดจ่ายต่อมือ (บาท)</Label>
					{#if errors.steppedPayments}<p class="text-xs text-destructive">{errors.steppedPayments}</p>{/if}
					<div class="grid grid-cols-5 gap-2">
						{#each Array.from({ length: totalRounds }) as _, i (i)}
							<div class="space-y-1">
								<p class="text-xs text-muted-foreground text-center">มือ {i + 1}</p>
								<Input
									type="number"
									min="1"
									bind:value={steppedPayments[i]}
									class="h-8 text-sm text-center"
								/>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<Separator />

		<!-- Rounds -->
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<Label>เลือกมือที่รับ</Label>
				<span class="text-xs text-muted-foreground">{selectedRounds.size}/{totalRounds} มือ</span>
			</div>

			{#if errors.myRound}<p class="text-xs text-destructive">{errors.myRound}</p>{/if}

			<div class="grid grid-cols-2 gap-2">
				{#each rounds as round, i (i)}
					<button
						type="button"
						onclick={() => {
							if (selectedRounds.has(i)) {
								selectedRounds.delete(i);
							} else {
								selectedRounds.add(i);
							}
							selectedRounds = new Set(selectedRounds);
						}}
						class="rounded-lg border p-3 text-left transition-colors {selectedRounds.has(i) ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-border hover:bg-muted/50'}"
					>
						<div class="flex items-center justify-between mb-1">
							<span class="font-medium">มือ {i + 1}</span>
							<Checkbox checked={selectedRounds.has(i)} class="pointer-events-none" />
						</div>
						<p class="text-xs text-muted-foreground">{formatDate(round.date)}</p>
						<p class="text-xs text-muted-foreground">จ่าย: {formatCurrency(round.paymentAmount)}</p>
					</button>
				{/each}
			</div>
		</div>

		<!-- Summary preview -->
		{#if myRoundNums.length > 0}
			<div class="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
				<p class="text-sm font-medium">สรุป</p>

				<div class="grid grid-cols-2 gap-3 text-sm">
					<div class="rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
						<p class="text-xs text-muted-foreground">เราได้รับรวม</p>
						<p class="font-bold text-green-600 dark:text-green-400">{formatCurrency(sumReceive)}</p>
						<p class="text-xs text-muted-foreground">มือ {myRoundNums.join(', ')}</p>
					</div>
					<div class="rounded-lg bg-red-50 p-3 dark:bg-red-950/20">
						<p class="text-xs text-muted-foreground">เราจ่ายรวม</p>
						<p class="font-bold text-red-500">{formatCurrency(sumOwe)}</p>
						<p class="text-xs text-muted-foreground">มือละ {formatCurrency(owePerRound)}</p>
					</div>
				</div>

				<div class="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm">
					<span class="text-muted-foreground">กำไร/ขาดทุน</span>
					<span class="font-bold {sumReceive - sumOwe >= 0 ? 'text-green-600' : 'text-red-500'}">
						{sumReceive - sumOwe >= 0 ? '+' : ''}{formatCurrency(sumReceive - sumOwe)}
					</span>
				</div>
			</div>
		{/if}

		<Button type="submit" class="w-full" size="lg">สร้างวง</Button>
	</form>
</div>
