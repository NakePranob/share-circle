<script lang="ts">
	import { goto } from '$app/navigation';
	import { groupsStore } from '$lib/stores/groups.svelte';
	import { formatCurrency, formatDate, iOweForRound } from '$lib/utils/calculator';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { CirclePlus, Users } from '@lucide/svelte';

	const groups = $derived(groupsStore.groups);
	const activeGroups = $derived(groups.filter((g) => g.isActive));
	const closedGroups = $derived(groups.filter((g) => !g.isActive));

	function paidCount(group: (typeof groups)[0]) {
		return group.rounds.filter((r) => r.status === 'paid').length;
	}

	function nextRound(group: (typeof groups)[0]) {
		return group.rounds.find((r) => r.status !== 'paid');
	}
</script>

<div class="p-4">
	<header class="mb-4 flex items-center justify-between">
		<h1 class="text-xl font-bold">วงแชร์</h1>
		<Button onclick={() => goto('/groups/new')} size="sm">
			<CirclePlus class="mr-1 h-4 w-4" />
			สร้างวงใหม่
		</Button>
	</header>

	<Tabs value="active">
		<TabsList class="w-full space-x-1">
			<TabsTrigger value="active" class="flex-1 bg-background">กำลังดำเนิน ({activeGroups.length})</TabsTrigger>
			<TabsTrigger value="closed" class="flex-1 bg-background">ปิดแล้ว ({closedGroups.length})</TabsTrigger>
		</TabsList>

		<TabsContent value="active" class="mt-4">
			{#if activeGroups.length === 0}
				<div class="flex flex-col items-center justify-center py-16 text-center">
					<Users class="mb-4 h-12 w-12 text-muted-foreground/40" />
					<p class="mb-4 text-sm text-muted-foreground">ยังไม่มีวงที่กำลังดำเนิน</p>
					<Button onclick={() => goto('/groups/new')}>
						<CirclePlus class="mr-2 h-4 w-4" />
						สร้างวงใหม่
					</Button>
				</div>
			{:else}
				<div class="space-y-3">
					{#each activeGroups as group (group.id)}
						{@const paid = paidCount(group)}
						{@const total = group.rounds.length}
						{@const next = nextRound(group)}
						{@const owe = iOweForRound(group)}
						<button
							onclick={() => goto(`/groups/${group.id}`)}
							class="w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:shadow-md"
						>
							<div class="mb-3 flex items-start justify-between">
								<div>
									<p class="font-semibold">{group.name}</p>
									<p class="text-xs text-muted-foreground">
										{total} มือ · มือเรา: {group.rounds.filter((r) => r.isMyRound).map((r) => r.roundNumber).join(', ')}
									</p>
								</div>
								<p class="text-xs text-muted-foreground">{paid}/{total}</p>
							</div>

							<Progress value={(paid / total) * 100} class="mb-2 h-1.5" />

							<div class="flex items-center justify-between text-xs text-muted-foreground">
								{#if next}
									<span>{formatDate(next.date)}</span>
									<span class="{next.isMyRound ? 'text-green-600' : 'text-red-500'} font-medium">
										{next.isMyRound ? `รับ ${formatCurrency(next.receiveAmount)}` : `จ่าย ${formatCurrency(owe)}`}
									</span>
								{:else}
									<span class="text-green-600">เสร็จสิ้น</span>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</TabsContent>

		<TabsContent value="closed" class="mt-4">
			{#if closedGroups.length === 0}
				<div class="flex flex-col items-center justify-center py-16 text-center">
					<p class="text-sm text-muted-foreground">ไม่มีวงที่ปิดแล้ว</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each closedGroups as group (group.id)}
						{@const paid = paidCount(group)}
						{@const total = group.rounds.length}
						<button
							onclick={() => goto(`/groups/${group.id}`)}
							class="w-full rounded-xl border border-border bg-card p-4 text-left opacity-70 shadow-sm transition-all hover:opacity-100"
						>
							<div class="mb-3 flex items-start justify-between">
								<p class="font-semibold">{group.name}</p>
								<Badge variant="outline" class="text-xs">ปิดแล้ว</Badge>
							</div>
							<Progress value={(paid / total) * 100} class="mb-2 h-1.5" />
							<p class="text-xs text-muted-foreground">มือ {paid}/{total}</p>
						</button>
					{/each}
				</div>
			{/if}
		</TabsContent>
	</Tabs>
</div>
