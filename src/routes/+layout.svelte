<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import './layout.css';

	import { House, Calendar, Users, History } from '@lucide/svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { useAppData } from '$features/shared/composables/useAppData.svelte';

	let { children } = $props();

	// Load all app data (groups, wallet) when user is authenticated
	useAppData();

	const navItems = [
		{ href: '/', label: 'หน้าหลัก', icon: House },
		{ href: '/calendar', label: 'ปฏิทิน', icon: Calendar },
		{ href: '/groups', label: 'วง', icon: Users },
		{ href: '/audit-log', label: 'บันทึก', icon: History }
	];

	function isActive(href: string) {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<div class="mx-auto flex min-h-screen max-w-2xl flex-col">
	<main class="flex-1 pb-20">
		{@render children()}
	</main>

	<nav
		class="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm"
	>
		<div class="mx-auto flex max-w-2xl">
			{#each navItems as item (item.href)}
				{@const active = isActive(item.href)}
				<button
					onclick={() => goto(item.href)}
					class="flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors {active
						? 'text-primary'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					<item.icon class="h-5 w-5" />
					<span>{item.label}</span>
				</button>
			{/each}
		</div>
	</nav>
</div>

<Toaster richColors position="top-center" />
