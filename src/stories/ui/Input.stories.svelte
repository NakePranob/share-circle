<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Input } from '$lib/components/ui/input';

	const { Story } = defineMeta({
		component: Input,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			type: {
				control: { type: 'select' },
				options: ['text', 'number', 'email', 'password', 'tel', 'url']
			},
			placeholder: {
				control: { type: 'text' }
			},
			disabled: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story name="Default" args={{ type: 'text', placeholder: 'เช่น วงแชร์บ้าน 2569', class: 'w-64' }} />

<Story name="Number" args={{ type: 'number', placeholder: '1000', class: 'w-64' }} />

<Story name="Disabled" args={{ type: 'text', placeholder: 'ไม่สามารถแก้ไขได้', disabled: true, class: 'w-64' }} />

<Story name="WithError" args={{ type: 'text', placeholder: 'กรอกชื่อวง', 'aria-invalid': 'true', class: 'w-64' }} />
