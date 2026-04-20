<script lang="ts">
	import { goto } from '$app/navigation';
	import { groupsStore } from '$lib/stores/groups.svelte';
	import { toast } from 'svelte-sonner';
	import { ArrowLeft } from '@lucide/svelte';
	import { useGroupForm } from '$features/groups/composables/useGroupForm.svelte';
	import GroupForm from '$features/groups/components/GroupForm.svelte';

	const form = useGroupForm();

	function submit() {
		if (!form.validate()) return;
		groupsStore.add({
			name: form.groupName.trim(),
			rounds: form.previewRounds,
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

	<GroupForm {form} onSubmit={submit} />
</div>
