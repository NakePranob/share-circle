<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { formatCurrency, formatDate } from '$lib/utils/calculator';
	import type { useGroupForm } from '$features/groups/composables/useGroupForm.svelte';

	interface Props {
		form: ReturnType<typeof useGroupForm>;
		onSubmit: () => void;
	}

	let { form, onSubmit }: Props = $props();
</script>

<form onsubmit={(e) => { e.preventDefault(); onSubmit(); }} class="space-y-6">
	<!-- Name -->
	<div class="space-y-2">
		<Label for="name">ชื่อวง</Label>
		<Input id="name" value={form.groupName} oninput={(e) => form.groupName = e.currentTarget.value} placeholder="เช่น วงแชร์บ้าน 2569" />
		{#if form.errors.name}<p class="text-xs text-destructive">{form.errors.name}</p>{/if}
	</div>

	<Separator />

	<!-- Group Settings -->
	<div class="space-y-4">
		<p class="text-sm font-medium">การตั้งค่าวง</p>

		<div class="space-y-2">
			<Label for="startDate">วันเริ่มต้น</Label>
			<Input id="startDate" type="date" value={form.startDate} onchange={(e) => form.startDate = e.currentTarget.value} />
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-2">
				<Label for="totalRounds">จำนวนมือทั้งหมด</Label>
				<Input id="totalRounds" type="number" min="2" value={form.totalRounds} oninput={(e) => form.totalRounds = Number(e.currentTarget.value)} class="text-center" />
			</div>
			<div class="space-y-2">
				<Label for="frequency">ความถี่ (วัน)</Label>
				<Input id="frequency" type="number" min="1" value={form.frequency} oninput={(e) => form.frequency = Number(e.currentTarget.value)} class="text-center" />
			</div>
		</div>

		<div class="space-y-2">
			<Label for="receiveAmount">ยอดรับต่อมือ (บาท)</Label>
			<Input id="receiveAmount" type="number" min="1" value={form.receiveAmountPerRound} oninput={(e) => form.receiveAmountPerRound = Number(e.currentTarget.value)} />
			{#if form.errors.receiveAmount}<p class="text-xs text-destructive">{form.errors.receiveAmount}</p>{/if}
		</div>

		<div class="space-y-2">
			<Label>รูปแบบการเล่น</Label>
			<RadioGroup.Root value={form.playMode} onValueChange={(v) => form.playMode = v as 'fixed' | 'stepped'}>
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
				<Label for="fixedPayment">ยอดจ่ายต่อมือ (บาท)</Label>
				<Input id="fixedPayment" type="number" min="1" value={form.fixedPaymentAmount} oninput={(e) => form.fixedPaymentAmount = Number(e.currentTarget.value)} />
				{#if form.errors.fixedPayment}<p class="text-xs text-destructive">{form.errors.fixedPayment}</p>{/if}
			</div>
		{:else}
			<div class="space-y-2">
				<Label>ยอดจ่ายต่อมือ (บาท)</Label>
				{#if form.errors.steppedPayments}<p class="text-xs text-destructive">{form.errors.steppedPayments}</p>{/if}
				<div class="grid grid-cols-5 gap-2">
					{#each Array.from({ length: form.totalRounds }), i (i)}
						<div class="space-y-1">
							<p class="text-xs text-muted-foreground text-center">มือ {i + 1}</p>
							<Input
								type="number"
								min="1"
								value={form.steppedPayments[i]}
								oninput={(e) => form.steppedPayments[i] = Number(e.currentTarget.value)}
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
			<span class="text-xs text-muted-foreground">{form.selectedRounds.size}/{form.totalRounds} มือ</span>
		</div>

		{#if form.errors.myRound}<p class="text-xs text-destructive">{form.errors.myRound}</p>{/if}

		<div class="grid grid-cols-2 gap-2">
			{#each form.rounds as round, i (i)}
				<button
					type="button"
					onclick={() => form.toggleRound(i)}
					class="rounded-lg border p-3 text-left transition-colors {form.selectedRounds.has(i) ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-border hover:bg-muted/50'}"
				>
					<div class="flex items-center justify-between mb-1">
						<span class="font-medium">มือ {i + 1}</span>
						<Checkbox checked={form.selectedRounds.has(i)} class="pointer-events-none" />
					</div>
					<p class="text-xs text-muted-foreground">{formatDate(round.date)}</p>
					<p class="text-xs text-muted-foreground">จ่าย: {formatCurrency(round.paymentAmount)}</p>
				</button>
			{/each}
		</div>
	</div>

	<!-- Summary preview -->
	{#if form.myRoundNums.length > 0}
		<div class="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
			<p class="text-sm font-medium">สรุป</p>

			<div class="grid grid-cols-2 gap-3 text-sm">
				<div class="rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
					<p class="text-xs text-muted-foreground">เราได้รับรวม</p>
					<p class="font-bold text-green-600 dark:text-green-400">{formatCurrency(form.sumReceive)}</p>
					<p class="text-xs text-muted-foreground">มือ {form.myRoundNums.join(', ')}</p>
				</div>
				<div class="rounded-lg bg-red-50 p-3 dark:bg-red-950/20">
					<p class="text-xs text-muted-foreground">เราจ่ายรวม</p>
					<p class="font-bold text-red-500">{formatCurrency(form.sumOwe)}</p>
					<p class="text-xs text-muted-foreground">มือละ {formatCurrency(form.owePerRound)}</p>
				</div>
			</div>

			<div class="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm">
				<span class="text-muted-foreground">กำไร/ขาดทุน</span>
				<span class="font-bold {form.sumReceive - form.sumOwe >= 0 ? 'text-green-600' : 'text-red-500'}">
					{form.sumReceive - form.sumOwe >= 0 ? '+' : ''}{formatCurrency(form.sumReceive - form.sumOwe)}
				</span>
			</div>
		</div>
	{/if}

	<Button type="submit" class="w-full" size="lg">สร้างวง</Button>
</form>
