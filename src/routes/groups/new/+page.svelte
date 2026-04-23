<script lang="ts">
	import { goto } from '$app/navigation';
	import { useGroupsStore } from '$features/groups/stores/groups.svelte';
	import { toast } from 'svelte-sonner';
	import { ArrowLeft } from '@lucide/svelte';

	const groupsStore = useGroupsStore();
	import GroupForm from '$features/groups/components/GroupForm.svelte';
	import type { GroupFormData } from '$features/groups/schemas/groupFormSchema';
	import { buildRoundsFromFormData } from '$features/groups/utils/calculators';

	function submit(data: GroupFormData) {
		const rounds = buildRoundsFromFormData(data);

		groupsStore.add({
			name: data.groupName.trim(),
			rounds,
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

	<GroupForm onSubmit={submit} />
</div>
