<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Dialog from '$lib/components/ui/dialog';
	import { formatCurrency, formatDate } from '$lib/utils/calculator';
	import { groupFormSchema } from '$features/groups/schemas/groupFormSchema';
	import type { GroupFormData } from '$features/groups/schemas/groupFormSchema';
	import { buildRoundsFromFormData, nextRoundOwe, totalIReceive, totalIOwe, totalManagementFee } from '$features/groups/utils/calculators';
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
		selectedRounds: [] as number[],
		managementFee: 0
	};

	let form = $state({ ...initialFormState });
	let errors = $state<Record<string, string>>({});
	let showConfirmDialog = $state(false);

	const formData = $derived<GroupFormData>({
		...form,
		fixedPaymentAmount: form.playMode === 'fixed' ? form.fixedPaymentAmount : undefined,
		steppedPayments: form.playMode === 'stepped' ? form.steppedPayments : undefined,
		managementFee: form.managementFee > 0 ? form.managementFee : undefined
	});

	const rounds = $derived(buildRoundsFromFormData(formData));

	const previewGroup = $derived({ id: '', name: form.groupName, rounds, createdAt: '', isActive: true });

	const myRoundNums = $derived(rounds.filter((r) => r.isMyRound).map((r) => r.roundNumber));
	const owePerRound = $derived(nextRoundOwe(previewGroup));
	const sumReceive = $derived(totalIReceive(previewGroup));
	const sumOwe = $derived(totalIOwe(previewGroup));
	const sumFee = $derived(totalManagementFee(previewGroup));
	const netProfit = $derived(sumReceive - sumOwe - sumFee);

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

	function handleConfirmSubmit() {
		onSubmit(formData);
		resetForm();
		showConfirmDialog = false;
	}
</script>

<form onsubmit={(e: Event) => { e.preventDefault(); if (validate()) { showConfirmDialog = true; } }} class="space-y-6">
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

		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-2">
				<Label for="receiveAmountPerRound">ยอดรับต่อมือ (บาท)</Label>
				<Input id="receiveAmountPerRound" type="number" min="1" bind:value={form.receiveAmountPerRound} />
				{#if errors.receiveAmountPerRound}<p class="text-xs text-destructive">{errors.receiveAmountPerRound}</p>{/if}
			</div>
			<div class="space-y-2">
				<Label for="managementFee">ค่าดูแลวง/มือ (บาท)</Label>
				<Input id="managementFee" type="number" min="0" bind:value={form.managementFee} />
				{#if errors.managementFee}<p class="text-xs text-destructive">{errors.managementFee}</p>{/if}
			</div>
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
					<p class="text-xs text-muted-foreground">จ่าย: {formatCurrency(form.playMode === 'fixed' ? (form.fixedPaymentAmount ?? 0) : (form.steppedPayments[i] ?? 0))}</p>
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

			{#if sumFee > 0}
				<div class="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
					<span class="text-muted-foreground">ค่าดูแลวงรวม</span>
					<span class="font-medium text-orange-500">-{formatCurrency(sumFee)}</span>
				</div>
			{/if}

			<div class="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm">
				<span class="text-muted-foreground">กำไร/ขาดทุน (สุทธิ)</span>
				<span class="font-bold {netProfit >= 0 ? 'text-green-600' : 'text-red-500'}">
					{netProfit >= 0 ? '+' : ''}{formatCurrency(netProfit)}
				</span>
			</div>
		</div>
	{/if}

	<Button type="submit" class="w-full" size="lg">สร้างวง</Button>
</form>

<!-- Confirm Dialog -->
<Dialog.Root bind:open={showConfirmDialog}>
	<Dialog.Content class="max-h-[95vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>ยืนยันการสร้างวง</Dialog.Title>
			<Dialog.Description>กรุณาตรวจสอบข้อมูลก่อนยืนยัน</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-2">
			<div class="space-y-2">
				<p class="text-sm font-medium">ชื่อวง</p>
				<p class="text-sm text-muted-foreground">{form.groupName}</p>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<p class="text-sm font-medium">จำนวนมือทั้งหมด</p>
					<p class="text-sm text-muted-foreground">{form.totalRounds} มือ</p>
				</div>
				<div class="space-y-2">
					<p class="text-sm font-medium">ความถี่</p>
					<p class="text-sm text-muted-foreground">{form.frequency} วัน</p>
				</div>
			</div>

			<div class="space-y-2">
				<p class="text-sm font-medium">วันเริ่มต้น</p>
				<p class="text-sm text-muted-foreground">{formatDate(form.startDate)}</p>
			</div>

			<div class="space-y-2">
				<p class="text-sm font-medium">รูปแบบการเล่น</p>
				<p class="text-sm text-muted-foreground">{form.playMode === 'fixed' ? 'แบบคงที่' : 'แบบขั้นบันได'}</p>
			</div>

			<div class="space-y-2">
				<p class="text-sm font-medium">ยอดรับต่อมือ</p>
				<p class="text-sm text-muted-foreground">{formatCurrency(form.receiveAmountPerRound)}</p>
			</div>

			<div class="space-y-2">
				<p class="text-sm font-medium">มือที่รับ</p>
				<p class="text-sm text-muted-foreground">มือ {myRoundNums.map((n) => n + 1).join(', ')}</p>
			</div>

			<div class="space-y-2">
				<p class="text-sm font-medium">ยอดจ่ายแต่ละมือ</p>
				<div class="max-h-48 overflow-y-auto rounded-lg border border-border">
					{#each rounds as round, i (i)}
						<div class="flex items-center justify-between border-b border-border px-3 py-2 last:border-b-0">
							<div class="flex items-center gap-3">
								<span class="text-xs font-medium text-muted-foreground">มือ {i + 1}</span>
								<span class="text-xs text-muted-foreground">{formatDate(round.date)}</span>
								{#if round.isMyRound}
									<span class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">รับ</span>
								{/if}
							</div>
							<span class="text-sm font-medium">{formatCurrency(round.paymentAmount)}</span>
						</div>
					{/each}
				</div>
			</div>

			{#if myRoundNums.length > 0}
				<div class="rounded-lg bg-muted p-4 space-y-2">
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">เราได้รับรวม</span>
						<span class="font-bold text-green-600">{formatCurrency(sumReceive)}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">เราจ่ายรวม</span>
						<span class="font-bold text-red-500">{formatCurrency(sumOwe)}</span>
					</div>
					{#if sumFee > 0}
						<div class="flex justify-between text-sm">
							<span class="text-muted-foreground">ค่าดูแลวงรวม</span>
							<span class="font-medium text-orange-500">-{formatCurrency(sumFee)}</span>
						</div>
					{/if}
					<div class="flex justify-between text-sm font-medium">
						<span>กำไร/ขาดทุน (สุทธิ)</span>
						<span class={netProfit >= 0 ? 'text-green-600' : 'text-red-500'}>
							{netProfit >= 0 ? '+' : ''}{formatCurrency(netProfit)}
						</span>
					</div>
				</div>
			{/if}
		</div>

		<Dialog.Footer>
			<Dialog.Close class="flex-1">
				<Button variant="outline" class="w-full md:flex-1">ยกเลิก</Button>
			</Dialog.Close>
			<Button onclick={handleConfirmSubmit} class="w-full md:flex-1">ยืนยัน</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
