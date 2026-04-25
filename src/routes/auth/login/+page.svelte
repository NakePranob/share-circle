<script lang="ts">
	import { onMount } from 'svelte';
	import { useAuth } from '$features/auth/composables/useAuth.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import liff from '@line/liff';

	const auth = useAuth();

	let email = $state('');
	let password = $state('');
	let liffReady = $state(false);
	let isInLineApp = $state(false);

	onMount(async () => {
		try {
			const liffId = import.meta.env.VITE_LINE_LIFF_ID;
			if (!liffId) return;
			await liff.init({ liffId });
			liffReady = true;
			isInLineApp = liff.isInClient();
			// Auto-complete if returning from LINE OAuth redirect
			if (liff.isLoggedIn()) {
				await auth.signInWithLine();
			}
		} catch (error) {
			console.error('LIFF init failed:', error);
		}
	});

	async function handleSubmit() {
		if (!email || !password) return;
		await auth.signIn(email, password);
	}
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<Card class="w-full max-w-md">
		<CardHeader>
			<CardTitle class="text-2xl">เข้าสู่ระบบ</CardTitle>
		</CardHeader>
		<CardContent>
			<form onsubmit={handleSubmit} class="space-y-4">
				<div class="space-y-2">
					<Label for="email">อีเมล</Label>
					<Input
						id="email"
						type="email"
						placeholder="your@email.com"
						bind:value={email}
						required
					/>
				</div>
				<div class="space-y-2">
					<Label for="password">รหัสผ่าน</Label>
					<Input
						id="password"
						type="password"
						placeholder="••••••••"
						bind:value={password}
						required
					/>
				</div>
				<Button type="submit" class="w-full" disabled={auth.loading}>
					{auth.loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
				</Button>
			</form>

			<div class="relative my-4">
				<div class="absolute inset-0 flex items-center">
					<span class="w-full border-t border-border"></span>
				</div>
				<div class="relative flex justify-center text-xs">
					<span class="bg-background px-2 text-muted-foreground">หรือ</span>
				</div>
			</div>

			<Button
				type="button"
				class="w-full bg-[#06C755] text-white hover:bg-[#05B04C]"
				disabled={auth.loading || !liffReady}
				onclick={() => auth.signInWithLine()}
			>
				{#if isInLineApp}
					เข้าสู่ระบบด้วย LINE
				{:else}
					เข้าสู่ระบบด้วย LINE
				{/if}
			</Button>

			<p class="mt-4 text-center text-sm text-muted-foreground">
				ยังไม่มีบัญชี?
				<a href="/auth/signup" class="text-primary hover:underline">สมัครสมาชิก</a>
			</p>
		</CardContent>
	</Card>
</div>
