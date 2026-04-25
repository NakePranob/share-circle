<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { supabase } from '$lib/supabase/client';

	onMount(async () => {
		const code = page.url.searchParams.get('code');
		if (code) {
			await supabase.auth.exchangeCodeForSession(code);
		}
		goto('/');
	});
</script>
