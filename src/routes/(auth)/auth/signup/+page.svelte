<script lang="ts">
	import { useAuth } from '$features/auth/composables/useAuth.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	const auth = useAuth();

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	async function handleSubmit() {
		if (!email || !password || !confirmPassword) return;
		if (password !== confirmPassword) {
			alert('รหัสผ่านไม่ตรงกัน');
			return;
		}
		await auth.signUp(email, password);
	}
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<Card class="w-full max-w-md">
		<CardHeader>
			<CardTitle class="text-2xl">สมัครสมาชิก</CardTitle>
		</CardHeader>
		<CardContent>
			<form onsubmit={handleSubmit} class="space-y-4">
				<div class="space-y-2">
					<Label for="email">อีเมล</Label>
					<Input id="email" type="email" placeholder="your@email.com" bind:value={email} required />
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
				<div class="space-y-2">
					<Label for="confirmPassword">ยืนยันรหัสผ่าน</Label>
					<Input
						id="confirmPassword"
						type="password"
						placeholder="••••••••"
						bind:value={confirmPassword}
						required
					/>
				</div>
				<Button type="submit" class="w-full" disabled={auth.loading}>
					{auth.loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
				</Button>
			</form>
			<p class="mt-4 text-center text-sm text-muted-foreground">
				มีบัญชีอยู่แล้ว?
				<a href="/auth/login" class="text-primary hover:underline">เข้าสู่ระบบ</a>
			</p>
		</CardContent>
	</Card>
</div>
