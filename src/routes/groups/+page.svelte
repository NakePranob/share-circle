<script lang="ts">
	import { goto } from '$app/navigation';
	import { groupsStore } from '$features/groups/stores/groups.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { CirclePlus, Users } from '@lucide/svelte';
	import GroupCard from '$features/groups/components/GroupCard.svelte';

	const groups = $derived(groupsStore.groups);
	const activeGroups = $derived(groups.filter((g) => g.isActive));
	const closedGroups = $derived(groups.filter((g) => !g.isActive));
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
						<GroupCard
							{group}
							isActive={true}
							onclick={() => goto(`/groups/${group.id}`)}
						/>
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
						<GroupCard
							{group}
							isActive={false}
							onclick={() => goto(`/groups/${group.id}`)}
						/>
					{/each}
				</div>
			{/if}
		</TabsContent>
	</Tabs>
</div>
