<script lang="ts">
	import { goto } from '$app/navigation';
	import { groupsStore } from '$lib/stores/groups.svelte';
	import { formatCurrency, formatDate, totalIOwe, totalIReceive, iOweForRound } from '$lib/utils/calculator';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { toast } from 'svelte-sonner';
	import { ArrowLeft, Plus, Trash2 } from '@lucide/svelte';
	import type { Round } from '$lib/types';

	interface RoundForm {
		date: string;
		amount: number;
		isMyRound: boolean;
	}

	let groupName = $state('');
	let errors = $state<Record<string, string>>({});

	const today = new Date().toISOString().split('T')[0];

	let rounds = $state<RoundForm[]>([
		{ date: today, amount: 5000, isMyRound: false },
		{ date: today, amount: 5000, isMyRound: false },
		{ date: today, amount: 5000, isMyRound: false }
	]);

	function addRound() {
		const last = rounds.at(-1);
		// Auto-increment date by 30 days from last round
		let nextDate = today;
		if (last?.date) {
			const d = new Date(last.date);
			d.setDate(d.getDate() + 30);
			nextDate = d.toISOString().split('T')[0];
		}
		rounds = [...rounds, { date: nextDate, amount: last?.amount ?? 5000, isMyRound: false }];
	}

	function removeRound(i: number) {
		if (rounds.length <= 2) return;
		rounds = rounds.filter((_, idx) => idx !== i);
	}

	// Preview as Group-like object for calculations
	const previewRounds = $derived(
		rounds.map((r, i) => ({
			roundNumber: i + 1,
			date: r.date,
			amount: r.amount,
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
		if (rounds.length < 2) errs.rounds = 'ต้องมีอย่างน้อย 2 มือ';
		if (rounds.some((r) => r.amount <= 0)) errs.amount = 'ยอดทุกมือต้องมากกว่า 0';
		if (!rounds.some((r) => r.isMyRound)) errs.myRound = 'เลือกมือที่เราได้รับอย่างน้อย 1 มือ';
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
		<button onclick={() => goto('/groups')} class="text-muted-foreground hover:text-foreground">
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

		<!-- Rounds -->
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<Label>รายการมือ</Label>
				<span class="text-xs text-muted-foreground">{rounds.length} มือ</span>
			</div>

			{#if errors.rounds}<p class="text-xs text-destructive">{errors.rounds}</p>{/if}
			{#if errors.amount}<p class="text-xs text-destructive">{errors.amount}</p>{/if}
			{#if errors.myRound}<p class="text-xs text-destructive">{errors.myRound}</p>{/if}

			<!-- Header -->
			<div class="grid grid-cols-[2rem_1fr_1fr_2.5rem_2rem] gap-2 px-1 text-xs font-medium text-muted-foreground">
				<span>มือ</span>
				<span>วันที่</span>
				<span>ยอดรับ (฿)</span>
				<span class="text-center">เรา</span>
				<span></span>
			</div>

			<div class="space-y-2">
				{#each rounds as round, i}
					<div class="grid grid-cols-[2rem_1fr_1fr_2.5rem_2rem] items-center gap-2">
						<span class="text-sm font-medium text-muted-foreground">{i + 1}</span>
						<Input type="date" bind:value={round.date} class="h-9 text-sm" />
						<Input
							type="number"
							min="1"
							bind:value={round.amount}
							class="h-9 text-sm"
							placeholder="ยอด"
						/>
						<div class="flex justify-center">
							<Checkbox
								checked={round.isMyRound}
								onCheckedChange={(v) => (round.isMyRound = !!v)}
								class="h-5 w-5"
							/>
						</div>
						<button
							type="button"
							onclick={() => removeRound(i)}
							disabled={rounds.length <= 2}
							class="text-muted-foreground hover:text-destructive disabled:opacity-30"
						>
							<Trash2 class="h-4 w-4" />
						</button>
					</div>
				{/each}
			</div>

			<Button type="button" variant="outline" size="sm" onclick={addRound} class="w-full">
				<Plus class="mr-2 h-4 w-4" />
				เพิ่มมือ
			</Button>
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
