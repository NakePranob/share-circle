<script lang="ts">
	import { useAuth } from '$features/auth/composables/useAuth.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	const auth = useAuth();

	let email = $state('');
	let password = $state('');

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
			<p class="mt-4 text-center text-sm text-muted-foreground">
				ยังไม่มีบัญชี?
				<a href="/auth/signup" class="text-primary hover:underline">สมัครสมาชิก</a>
			</p>
		</CardContent>
	</Card>
</div>
