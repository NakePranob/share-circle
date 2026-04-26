<script lang="ts">
	import { goto } from '$app/navigation';
	import { useGroupsStore } from '$features/groups/stores/groups.svelte';
	import { toast } from 'svelte-sonner';
	import { ArrowLeft } from '@lucide/svelte';

	const groupsStore = useGroupsStore();
	import GroupForm from '$features/groups/components/GroupForm.svelte';
	import type { GroupFormData } from '$features/groups/schemas/groupFormSchema';
	import { buildRoundsFromFormData } from '$features/groups/utils/calculators';

	let isSubmitting = $state(false);

	async function submit(data: GroupFormData) {
		isSubmitting = true;
		try {
			const rounds = buildRoundsFromFormData(data);

			await groupsStore.add({
				name: data.groupName.trim(),
				rounds,
				isActive: true
			});
			toast.success('สร้างวงแชร์เรียบร้อย!');
			goto('/groups');
		} catch (error) {
			console.error('Failed to create group:', error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="p-4">
	<header class="mb-6 flex items-center gap-3">
		<button
			type="button"
			onclick={() => goto('/groups')}
			class="text-muted-foreground hover:text-foreground"
		>
			<ArrowLeft class="h-5 w-5" />
		</button>
		<h1 class="text-xl font-bold">สร้างวงใหม่</h1>
	</header>

	<GroupForm onSubmit={submit} {isSubmitting} />
</div>
