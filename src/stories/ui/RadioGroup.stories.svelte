<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
	import { Label } from '$lib/components/ui/label';

	const { Story } = defineMeta({
		component: RadioGroup,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			value: {
				control: { type: 'text' }
			}
		}
	});
</script>

<Story name="Default">
	<div class="w-80">
		<RadioGroup value="option1">
			<div class="flex items-center gap-2">
				<RadioGroupItem value="option1" id="r1" />
				<Label for="r1">ตัวเลือกที่ 1</Label>
			</div>
			<div class="flex items-center gap-2">
				<RadioGroupItem value="option2" id="r2" />
				<Label for="r2">ตัวเลือกที่ 2</Label>
			</div>
			<div class="flex items-center gap-2">
				<RadioGroupItem value="option3" id="r3" />
				<Label for="r3">ตัวเลือกที่ 3</Label>
			</div>
		</RadioGroup>
	</div>
</Story>

<Story name="WithLabel">
	<div class="w-80 space-y-4">
		<Label>เลือกวิธีการชำระเงิน</Label>
		<RadioGroup value="cash">
			<div class="flex items-center gap-2">
				<RadioGroupItem value="cash" id="cash" />
				<Label for="cash">เงินสด</Label>
			</div>
			<div class="flex items-center gap-2">
				<RadioGroupItem value="bank" id="bank" />
				<Label for="bank">โอนเงินผ่านธนาคาร</Label>
			</div>
			<div class="flex items-center gap-2">
				<RadioGroupItem value="promptpay" id="promptpay" />
				<Label for="promptpay">พร้อมเพย์</Label>
			</div>
		</RadioGroup>
	</div>
</Story>

<Story name="Disabled">
	<div class="w-80">
		<RadioGroup value="option1">
			<div class="flex items-center gap-2">
				<RadioGroupItem value="option1" id="d1" disabled />
				<Label for="d1" class="opacity-50">ตัวเลือกที่ 1 (ปิดใช้งาน)</Label>
			</div>
			<div class="flex items-center gap-2">
				<RadioGroupItem value="option2" id="d2" disabled />
				<Label for="d2" class="opacity-50">ตัวเลือกที่ 2 (ปิดใช้งาน)</Label>
			</div>
		</RadioGroup>
	</div>
</Story>
