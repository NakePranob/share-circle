<script lang="ts">
	import { Verified } from '@lucide/svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import * as Checkbox from '$lib/components/ui/checkbox';
	import * as Slider from '$lib/components/ui/slider';

	let circleName = $state('');
	let contribution = $state(5000);
	let totalHands = $state(12);
	let frequency = $state('7');
	let payout = $state('');

	let payoutDisplay = $derived(payout ? Number(payout).toLocaleString() : '');

	function handlePayoutInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		const rawValue = target.value.replace(/[^0-9]/g, '');
		target.value = rawValue ? Number(rawValue).toLocaleString() : '';
		payout = rawValue;
	}

	let selectedPeriods = $state(new Set<number>());

	function togglePeriod(index: number) {
		if (selectedPeriods.has(index)) {
			selectedPeriods.delete(index);
		} else {
			selectedPeriods.add(index);
		}
	}

	let schedule = $state<{ period: string; principal: number; payment: number | null }[]>([]);

	$effect(() => {
		const currentLength = schedule.length;
		const targetLength = totalHands;

		if (currentLength === 0) {
			// Initialize schedule
			for (let i = 0; i < targetLength; i++) {
				schedule.push({
					period: String(i + 1).padStart(2, '0'),
					principal: contribution,
					payment: contribution
				});
			}
		} else if (currentLength < targetLength) {
			// Add new rows
			for (let i = currentLength; i < targetLength; i++) {
				schedule.push({
					period: String(i + 1).padStart(2, '0'),
					principal: contribution,
					payment: contribution
				});
			}
		} else if (currentLength > targetLength) {
			// Remove excess rows and clear selections
			schedule = schedule.slice(0, targetLength);
			selectedPeriods.clear();
		}
	});

	// Update principal and reset payment when contribution changes
	$effect(() => {
		for (let i = 0; i < schedule.length; i++) {
			schedule[i].principal = contribution;
			schedule[i].payment = contribution;
		}
	});

	function updatePayment(index: number, e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		const rawValue = target.value.replace(/[^0-9]/g, '');
		target.value = rawValue ? Number(rawValue).toLocaleString() : '';
		schedule[index].payment = rawValue ? Number(rawValue) : null;
	}
</script>

<svelte:head>
	<title>สร้างวงแชร์ใหม่ - Share Circle</title>
</svelte:head>

<div class="space-y-8">
	<!-- Capital Pool Info Card -->
	<section>
		<Card.Root class="bg-foreground text-input shadow-lg">
			<Card.Content class="space-y-4">
				<div class="space-y-1">
					<p class="text-xs font-bold uppercase tracking-widest text-muted-foreground">ทุนกลางปัจจุบัน</p>
					<div class="flex items-baseline gap-2">
						<span class="text-3xl font-bold tracking-tight">฿1,240,000</span>
						<span class="text-sm text-muted-foreground font-medium">THB</span>
					</div>
				</div>
				<div class="pt-4 border-t border-zinc-800 flex justify-between items-center">
					<span class="text-xs text-muted-foreground">พร้อมสำหรับสมาชิกวงใหม่</span>
					<Verified size={16} class="text-muted-foreground" />
				</div>
			</Card.Content>
		</Card.Root>
	</section>

	<!-- Form Section -->
	<form class="space-y-8">
		<!-- Basic Details -->
		<section class="space-y-6">
			<div class="space-y-2">
				<Label for="circleName">ชื่อวงแชร์</Label>
				<Input id="circleName" bind:value={circleName} placeholder="ระบุชื่อวงแชร์ของคุณ" />
			</div>

		</section>

		<!-- Financial Logic -->
		<section class="p-6 rounded-xl border border-border bg-accent/30 space-y-6">
			<div class="space-y-4">
				<div class="flex justify-between items-center">
					<Label for="contribution">เงินต่องวด (Contribution)</Label>
					<span class="font-bold">฿{contribution.toLocaleString()}</span>
				</div>
				<Slider.Root
					bind:value={contribution}
					type="single"
					min={1000}
					max={50000}
					step={500}
					class="w-full"
				/>
				<div class="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
					<span>฿1,000</span>
					<span>฿50,000</span>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="totalHands">จำนวนมือ (Total Hands)</Label>
					<div class="relative">
						<Input
							id="totalHands"
							type="number"
							bind:value={totalHands}
						/>
						<span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">มือ</span>
					</div>
				</div>

				<div class="space-y-2">
					<Label>ความถี่ (Frequency)</Label>
					<Select.Root bind:value={frequency} type="single">
						<Select.Trigger class="w-full">
							{frequency} วัน
						</Select.Trigger>
						<Select.Content class="max-h-54">
							{#each Array.from({ length: 30 }, (_, i) => i + 1) as day (day)}
								<Select.Item value={String(day)}>{day} วัน</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
			<div class="space-y-2">
				<Label for="payout">รับเงิน</Label>
				<Input
					id="payout"
					type="tel"
					inputmode="numeric"
					placeholder="25,000"
					value={payoutDisplay}
					oninput={handlePayoutInput}
				/>
			</div>

		</section>

		<!-- Variable Pricing -->
		<section class="space-y-4">
			<div class="flex justify-between items-center">
				<h3 class="font-semibold text-sm">กำหนดราคาผันผวน (Variable)</h3>
				<Badge variant="secondary" class="text-[10px] font-bold">Advanced Mode</Badge>
			</div>

			<Card.Root>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-[50px]">รับ</Table.Head>
							<Table.Head class="w-[80px]">งวดที่</Table.Head>
							<Table.Head>เงินต้น</Table.Head>
							<Table.Head class="text-right">ส่งงวด</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each schedule as item, index (item.period)}
							<Table.Row class={selectedPeriods.has(index) ? 'bg-primary/10' : ''}>
								<Table.Cell>
									<Checkbox.Root
										checked={selectedPeriods.has(index)}
										onchange={() => togglePeriod(index)}
									/>
								</Table.Cell>
								<Table.Cell class="font-semibold text-muted-foreground">{item.period}</Table.Cell>
								<Table.Cell>฿{item.principal.toLocaleString()}</Table.Cell>
								<Table.Cell class="text-right">
									<input
										type="text"
										inputmode="numeric"
										value={item.payment?.toLocaleString() ?? ''}
										oninput={(e) => updatePayment(index, e)}
										class="w-24 text-right font-bold bg-transparent border-none p-0 focus:ring-0"
										placeholder="ระบุจำนวน"
									/>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Root>
		</section>

		<!-- Submit Button -->
		<section class="pt-4 space-y-4">
			<Button type="submit" class="w-full h-12 font-semibold">
				สร้างวงแชร์
			</Button>
			<p class="text-center text-[10px] text-muted-foreground leading-relaxed max-w-[80%] mx-auto">
				เมื่อกดสร้างวงแชร์ คุณยอมรับเงื่อนไขการกำกับดูแลของ Chai Trust
			</p>
		</section>
	</form>
</div>
