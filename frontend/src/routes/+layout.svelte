<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Menu, Home, Users, Building2 } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';

	let { children } = $props();
	let openMenu = $state(false);

	const navItems = [
		{ label: 'หน้าหลัก', icon: Home,      href: '/',        active: true  },
		{ label: 'วงแชร์',   icon: Users,     href: '/circles', active: false },
		{ label: 'ทุนกลาง',  icon: Building2, href: '/capital', active: false },
	] as const;
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<!-- TopAppBar Shared Component -->
<header
	class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50"
>
	<div class="flex justify-between items-center px-4 h-16 w-full max-w-md mx-auto">
		<div class="flex items-center gap-3">
			<h1 class="text-lg font-bold tracking-tighter text-foreground">Share Circle</h1>
		</div>
		<Button 
			variant="ghost" 
			class="bg-secondary"
			onclick={() => (openMenu = true)}
		>
			<Menu size={20} />
		</Button>
	</div>
</header>

{#if openMenu}
	<Sheet.Root bind:open={openMenu}>
		<Sheet.Content side="right" class="w-80">
			<Sheet.Header class="flex flex-row items-center justify-between border-b border-border px-6">
				<Sheet.Title class="text-lg font-bold">เมนู</Sheet.Title>
			</Sheet.Header>
			<div class="flex flex-col gap-1 p-4">
				{#each navItems as item (item.href)}
					<Button
						variant={item.active ? 'secondary' : 'ghost'}
						class={['justify-start gap-3 h-12 px-4', item.active ? 'bg-primary text-primary-foreground' : 'hover:bg-accent']}
						href={item.href}
					>
						<item.icon size={20} class={item.active ? 'text-primary-foreground' : 'text-muted-foreground'} />
						<span class="font-medium">{item.label}</span>
						{#if item.active}
							<div class="ml-auto w-2 h-2 rounded-full bg-primary-foreground"></div>
						{/if}
					</Button>
				{/each}
				<div class="border-t border-border my-2"></div>
				<Button variant="ghost" class="justify-start gap-3 h-12 px-4 hover:bg-accent">
					<Users size={20} class="text-muted-foreground" />
					<span class="font-medium text-muted-foreground">ตั้งค่า</span>
				</Button>
				<Button variant="ghost" class="justify-start gap-3 h-12 px-4 hover:bg-destructive/10 text-destructive">
					<Building2 size={20} />
					<span class="font-medium">ออกจากระบบ</span>
				</Button>
			</div>
		</Sheet.Content>
	</Sheet.Root>
{/if}

<main class="pt-24 pb-32 px-4 max-w-md mx-auto">
	{@render children()}
</main>
