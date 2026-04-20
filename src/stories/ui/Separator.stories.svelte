<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Separator } from '$lib/components/ui/separator';

	const { Story } = defineMeta({
		component: Separator,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			orientation: {
				control: { type: 'select' },
				options: ['horizontal', 'vertical']
			}
		}
	});
</script>

<Story name="Horizontal">
	<div class="w-64 space-y-4">
		<p class="text-sm">ด้านบน</p>
		<Separator />
		<p class="text-sm">ด้านล่าง</p>
	</div>
</Story>

<Story name="Vertical">
	<div class="flex h-12 items-center gap-4">
		<p class="text-sm">ซ้าย</p>
		<Separator orientation="vertical" />
		<p class="text-sm">ขวา</p>
	</div>
</Story>
