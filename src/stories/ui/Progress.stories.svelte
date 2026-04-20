<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Progress } from '$lib/components/ui/progress';

	const { Story } = defineMeta({
		component: Progress,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			value: {
				control: { type: 'range', min: 0, max: 100, step: 1 }
			}
		}
	});
</script>

<Story name="Empty" args={{ value: 0, class: 'w-64' }} />

<Story name="Half" args={{ value: 50, class: 'w-64' }} />

<Story name="Complete" args={{ value: 100, class: 'w-64' }} />

<Story name="Thin" args={{ value: 60, class: 'w-64 h-1.5' }} />
