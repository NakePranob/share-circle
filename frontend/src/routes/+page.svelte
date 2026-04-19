<script lang="ts">
	import {
		Wallet,
		CreditCard,
		Clock,
		TriangleAlert,
		Plus
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
</script>

<svelte:head>
	<meta charset="utf-8" />
	<meta content="width=device-width, initial-scale=1.0" name="viewport" />
</svelte:head>

<div class="space-y-6">
	<!-- Monthly Summary Section -->
	<section class="space-y-4">
		<div class="space-y-2">
			<p class="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
				MONTHLY OVERVIEW
			</p>
			<h2 class="text-3xl font-bold tracking-tight text-foreground">สรุปประจำเดือน</h2>
		</div>
		<Card.Root class="bg-foreground text-input shadow-lg">
			<Card.Content class="space-y-6">
				<div class="space-y-2">
					<p class="text-sm font-medium opacity-70">ยอดรวมที่ต้องชำระ</p>
					<div class="flex items-baseline gap-1">
						<span class="text-4xl font-black tracking-tighter">฿42,500</span>
						<span class="text-sm font-medium opacity-60">.00</span>
					</div>
				</div>
				<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div class="flex gap-3 w-full sm:w-auto">
						<div class="flex-1 sm:flex-none bg-white/10 px-4 py-2 rounded-lg border border-white/10">
							<p class="text-xs opacity-60 uppercase font-bold tracking-wide mb-1">จ่ายแล้ว</p>
							<p class="text-lg font-semibold">฿15,000</p>
						</div>
						<div class="flex-1 sm:flex-none bg-white/10 px-4 py-2 rounded-lg border border-white/10">
							<p class="text-xs opacity-60 uppercase font-bold tracking-wide mb-1">คงเหลือ</p>
							<p class="text-lg font-semibold text-destructive">฿27,500</p>
						</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</section>

	<!-- Capital Pool Section -->
	<section>
		<Card.Root outline>
			<Card.Content class="space-y-5">
				<div class="flex justify-between items-start">
					<div class="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center" role="img" aria-label="เงินทุน">
						<Wallet size={20} class="text-foreground" />
					</div>
					<Badge variant="secondary" class="text-xs font-bold">Active Pool</Badge>
				</div>
				<div class="space-y-1">
					<p class="text-sm text-muted-foreground font-medium">เงินทุนกลางคงเหลือ</p>
					<p class="text-3xl font-bold tracking-tight">฿128,400</p>
				</div>
				<div class="pt-4 border-t border-border flex items-center gap-2">
					<div class="w-2 h-2 rounded-full bg-primary" aria-hidden="true"></div>
					<span class="text-sm text-muted-foreground font-medium">กำลังรัน: 4 วงแชร์</span>
				</div>
			</Card.Content>
		</Card.Root>
	</section>

	<!-- Installments List -->
	<section class="space-y-4">
		<div class="flex justify-between items-center">
			<h3 class="text-lg font-bold text-foreground">รายการที่ต้องชำระ</h3>
			<Button variant="ghost" size="sm">
				ดูทั้งหมด
			</Button>
		</div>
		<div class="space-y-3">
			<!-- Item: Paid -->
			<Card.Root outline class="group hover:bg-accent/50 transition-colors">
				<Card.Content class="flex justify-between items-center px-4">
					<div class="flex items-center gap-4">
						<div class="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center" role="img" aria-label="วงแชร์">
							<CreditCard size={24} class="text-foreground" />
						</div>
						<div class="space-y-1">
							<p class="font-semibold text-base">วงแชร์พนักงานออฟฟิศ</p>
							<p class="text-sm text-muted-foreground">งวดที่ 4/12 • 2 มิ.ย.</p>
						</div>
					</div>
					<div class="text-right space-y-1">
						<p class="font-semibold text-base">฿3,500</p>
						<Button variant="default" size="sm" class="mt-1">จ่ายงวด</Button>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Item: Pending -->
			<Card.Root outline class="group hover:bg-accent/50 transition-colors">
				<Card.Content class="flex justify-between items-center px-4">
					<div class="flex items-center gap-4">
						<div class="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center" role="img" aria-label="รอชำระ">
							<Clock size={24} class="text-foreground" />
						</div>
						<div class="space-y-1">
							<p class="font-semibold text-base">กองทุนครอบครัวฉลอง</p>
							<p class="text-sm text-muted-foreground">งวดที่ 2/24 • 7 มิ.ย.</p>
						</div>
					</div>
					<div class="text-right space-y-1">
						<p class="font-semibold text-base">฿12,000</p>
						<Button variant="default" size="sm" class="mt-1">จ่ายงวด</Button>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Item: Overdue -->
			<Card.Root outline class="group hover:bg-accent/50 transition-colors">
				<Card.Content class="flex justify-between items-center px-4">
					<div class="flex items-center gap-4">
						<div class="w-12 h-12 rounded-lgw bg-destructive/10 flex items-center justify-center" role="img" aria-label="ค้างชำระ">
							<TriangleAlert size={24} class="text-destructive" />
						</div>
						<div class="space-y-1">
							<p class="font-semibold text-base">แชร์วงน้องหมา (มือบ๊วย)</p>
							<p class="text-sm text-destructive font-medium">ค้างชำระ • 28 พ.ค.</p>
						</div>
					</div>
					<div class="text-right space-y-1">
						<p class="font-semibold text-base text-destructive">฿1,200</p>
						<Button variant="default" size="sm" class="mt-1">จ่ายงวด</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</section>

	<!-- Banner -->
	<Card.Root outline class="bg-linear-to-r from-secondary to-secondary/50">
		<Card.Content class="flex items-center gap-6 p-6">
			<div class="flex-1 space-y-2">
				<h4 class="text-base font-bold">ต้องการเปิดวงแชร์ใหม่?</h4>
				<p class="text-sm text-muted-foreground leading-relaxed">
					วางแผนการออมกับเพื่อนที่ไว้ใจด้วยระบบจัดการที่โปร่งใส
				</p>
			</div>
			<div class="w-20 h-20 bg-background border border-border rounded-xl overflow-hidden shrink-0 shadow-sm">
				<img
					alt="Team collab"
					class="w-full h-full object-cover opacity-90 grayscale hover:grayscale-0 transition-all duration-300"
					src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAzTFJuzEsBfCm3Ot_YG2mQUE6an1awKZg0UVAzg1SuQZrYveNH4ZYQ3djjDAZGmhfPLWNg7IteBe41S-WL4FtvCmTjTBBWGKwQvWaPdfKvbLU1V7GuMMS95kEFHXL8BEltfMpFTK4tRTbiX96LxJW9u1sZpdGLDnYVAvjt9nM0K6wXziaShINndNZuPWAreIweRWBS-1ft3loqjgamZP1rae4TX0cIhlIzudmdaoYnDUC0wo5wN9w7c7VSlA3gHL9jmGVND0PtPA"
				/>
			</div>
		</Card.Content>
	</Card.Root>
</div>

<!-- FAB -->
<Button
	href="/add-new"
	class="fixed bottom-4 right-4 sm:right-6 w-14 h-14 rounded-full shadow-xl z-50 border border-border hover:scale-105 transition-transform"
	size="icon"
	aria-label="เพิ่มวงแชร์ใหม่"
>
	<Plus size={28} />
</Button>
