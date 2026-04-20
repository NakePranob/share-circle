<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { formatCurrency, formatDate } from '$lib/utils/calculator';
	import { groupFormSchema } from '$features/groups/schemas/groupFormSchema';
	import type { GroupFormData } from '$features/groups/schemas/groupFormSchema';
	import { buildRoundsFromFormData, iOweForRound, totalIReceive, totalIOwe } from '$features/groups/utils/calculators';
	import { SvelteDate } from 'svelte/reactivity';
	import {
		DEFAULT_TOTAL_ROUNDS,
		DEFAULT_FREQUENCY,
		DEFAULT_RECEIVE_AMOUNT_PER_ROUND,
		DEFAULT_FIXED_PAYMENT_AMOUNT
	} from '$features/groups/constants';

	interface Props {
		onSubmit: (data: GroupFormData) => void;
	}

	let { onSubmit }: Props = $props();

	const initialFormState = {
		groupName: '',
		totalRounds: DEFAULT_TOTAL_ROUNDS,
		playMode: 'fixed' as 'fixed' | 'stepped',
		frequency: DEFAULT_FREQUENCY,
		receiveAmountPerRound: DEFAULT_RECEIVE_AMOUNT_PER_ROUND,
		startDate: new SvelteDate().toISOString().split('T')[0],
		fixedPaymentAmount: DEFAULT_FIXED_PAYMENT_AMOUNT,
		steppedPayments: [] as number[],
		selectedRounds: [] as number[]
	};

	let form = $state({ ...initialFormState });
	let errors = $state<Record<string, string>>({});

	const formData = $derived<GroupFormData>({
		...form,
		fixedPaymentAmount: form.playMode === 'fixed' ? form.fixedPaymentAmount : undefined,
		steppedPayments: form.playMode === 'stepped' ? form.steppedPayments : undefined
	});

	const rounds = $derived(buildRoundsFromFormData(formData));

	const previewGroup = $derived({ id: '', name: form.groupName, rounds, createdAt: '', isActive: true });

	const myRoundNums = $derived(rounds.filter((r) => r.isMyRound).map((r) => r.roundNumber));
	const owePerRound = $derived(iOweForRound(previewGroup));
	const sumReceive = $derived(totalIReceive(previewGroup));
	const sumOwe = $derived(totalIOwe(previewGroup));

	function validate(): boolean {
		const result = groupFormSchema.safeParse(formData);

		if (!result.success) {
			const errs: Record<string, string> = {};
			for (const error of result.error.issues) {
				errs[error.path[0] as string] = error.message;
			}
			errors = errs;
			return false;
		}

		errors = {};
		return true;
	}

	function toggleRound(i: number) {
		const index = form.selectedRounds.indexOf(i);
		if (index === -1) {
			form.selectedRounds = [...form.selectedRounds, i];
		} else {
			form.selectedRounds = form.selectedRounds.filter((_, idx) => idx !== index);
		}
	}

	function resetForm() {
		Object.assign(form, { ...initialFormState, startDate: new SvelteDate().toISOString().split('T')[0] });
		errors = {};
	}
</script>

<form onsubmit={(e: Event) => { e.preventDefault(); if (validate()) { onSubmit(formData); resetForm(); } }} class="space-y-6">
	<!-- Name -->
	<div class="space-y-2">
		<Label for="groupName">ชื่อวง</Label>
		<Input id="groupName" bind:value={form.groupName} placeholder="เช่น วงแชร์บ้าน 2569" />
		{#if errors.groupName}<p class="text-xs text-destructive">{errors.groupName}</p>{/if}
	</div>

	<Separator />

	<!-- Group Settings -->
	<div class="space-y-4">
		<p class="text-sm font-medium">การตั้งค่าวง</p>

		<div class="space-y-2">
			<Label for="startDate">วันเริ่มต้น</Label>
			<Input id="startDate" type="date" bind:value={form.startDate} />
			{#if errors.startDate}<p class="text-xs text-destructive">{errors.startDate}</p>{/if}
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-2">
				<Label for="totalRounds">จำนวนมือทั้งหมด</Label>
				<Input id="totalRounds" type="number" min="2" bind:value={form.totalRounds} class="text-center" />
				{#if errors.totalRounds}<p class="text-xs text-destructive">{errors.totalRounds}</p>{/if}
			</div>
			<div class="space-y-2">
				<Label for="frequency">ความถี่ (วัน)</Label>
				<Input id="frequency" type="number" min="1" bind:value={form.frequency} class="text-center" />
				{#if errors.frequency}<p class="text-xs text-destructive">{errors.frequency}</p>{/if}
			</div>
		</div>

		<div class="space-y-2">
			<Label for="receiveAmountPerRound">ยอดรับต่อมือ (บาท)</Label>
			<Input id="receiveAmountPerRound" type="number" min="1" bind:value={form.receiveAmountPerRound} />
			{#if errors.receiveAmountPerRound}<p class="text-xs text-destructive">{errors.receiveAmountPerRound}</p>{/if}
		</div>

		<div class="space-y-2">
			<Label>รูปแบบการเล่น</Label>
			<RadioGroup.Root bind:value={form.playMode}>
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

		{#if form.playMode === 'fixed'}
			<div class="space-y-2">
				<Label for="fixedPaymentAmount">ยอดจ่ายต่อมือ (บาท)</Label>
				<Input id="fixedPaymentAmount" type="number" min="1" bind:value={form.fixedPaymentAmount} />
				{#if errors.fixedPaymentAmount}<p class="text-xs text-destructive">{errors.fixedPaymentAmount}</p>{/if}
			</div>
		{:else}
			<div class="space-y-2">
				<Label>ยอดจ่ายต่อมือ (บาท)</Label>
				{#if errors.steppedPayments}<p class="text-xs text-destructive">{errors.steppedPayments}</p>{/if}
				<div class="grid grid-cols-4 gap-2">
					{#each Array.from({ length: form.totalRounds }), i (i)}
						<div class="space-y-1">
							<p class="text-xs text-muted-foreground text-center">มือ {i + 1}</p>
							<Input
								type="number"
								min="1"
								bind:value={form.steppedPayments[i]}
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
			<span class="text-xs text-muted-foreground">{form.selectedRounds.length}/{form.totalRounds} มือ</span>
		</div>

		{#if errors.selectedRounds}<p class="text-xs text-destructive">{errors.selectedRounds}</p>{/if}

		<div class="grid grid-cols-2 gap-2">
			{#each rounds as round, i (i)}
				<button
					type="button"
					onclick={() => toggleRound(i)}
					class="rounded-lg border p-3 text-left transition-colors {form.selectedRounds.includes(i) ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-border hover:bg-muted/50'}"
				>
					<div class="flex items-center justify-between mb-1">
						<span class="font-medium">มือ {i + 1}</span>
						<Checkbox checked={form.selectedRounds.includes(i)} class="pointer-events-none" />
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
