<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Checkbox } from '$lib/components/ui/checkbox';

	const { Story } = defineMeta({
		component: Label,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			for: {
				control: { type: 'text' }
			},
			class: {
				control: { type: 'text' }
			}
		}
	});
</script>

<Story name="Default">
	<Label>ชื่อผู้ใช้</Label>
</Story>

<Story name="WithInput">
	<div class="grid w-full max-w-sm items-center gap-1.5">
		<Label for="email">อีเมล</Label>
		<Input id="email" type="email" placeholder="name@example.com" />
	</div>
</Story>

<Story name="WithCheckbox">
	<div class="flex items-center gap-2">
		<Checkbox id="terms" />
		<Label for="terms">ยอมรับเงื่อนไขการใช้งาน</Label>
	</div>
</Story>

<Story name="Disabled">
	<Label class="opacity-50">ปิดใช้งาน</Label>
</Story>

<Story name="Form">
	<div class="grid w-full max-w-sm gap-4">
		<div class="grid gap-2">
			<Label for="username">ชื่อผู้ใช้</Label>
			<Input id="username" placeholder="ชื่อผู้ใช้ของคุณ" />
		</div>
		<div class="grid gap-2">
			<Label for="password">รหัสผ่าน</Label>
			<Input id="password" type="password" placeholder="รหัสผ่าน" />
		</div>
		<div class="flex items-center gap-2">
			<Checkbox id="remember" />
			<Label for="remember">จดจำฉันไว้</Label>
		</div>
	</div>
</Story>
