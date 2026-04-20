<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';

	const { Story } = defineMeta({
		component: Checkbox,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			checked: {
				control: { type: 'boolean' }
			},
			indeterminate: {
				control: { type: 'boolean' }
			},
			disabled: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story name="Default" args={{ checked: false, indeterminate: false, disabled: false }} />

<Story name="Checked" args={{ checked: true, indeterminate: false, disabled: false }} />

<Story name="Indeterminate" args={{ checked: false, indeterminate: true, disabled: false }} />

<Story name="Disabled" args={{ checked: false, indeterminate: false, disabled: true }} />

<Story name="WithLabel">
	<div class="flex items-center gap-2">
		<Checkbox id="terms" />
		<Label for="terms">ยอมรับเงื่อนไขการใช้งาน</Label>
	</div>
</Story>

<Story name="Multiple">
	<div class="flex flex-col gap-4">
		<div class="flex items-center gap-2">
			<Checkbox id="option1" />
			<Label for="option1">ตัวเลือกที่ 1</Label>
		</div>
		<div class="flex items-center gap-2">
			<Checkbox id="option2" checked={true} />
			<Label for="option2">ตัวเลือกที่ 2</Label>
		</div>
		<div class="flex items-center gap-2">
			<Checkbox id="option3" />
			<Label for="option3">ตัวเลือกที่ 3</Label>
		</div>
	</div>
</Story>
