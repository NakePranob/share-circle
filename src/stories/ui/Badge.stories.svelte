<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Badge } from '$lib/components/ui/badge';

	const { Story } = defineMeta({
		component: Badge,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['default', 'secondary', 'destructive', 'outline']
			}
		}
	});
</script>

<Story name="Default" args={{ variant: 'default' }}>ใช้งาน</Story>

<Story name="Secondary" args={{ variant: 'secondary' }}>รอดำเนินการ</Story>

<Story name="Destructive" args={{ variant: 'destructive' }}>ค้างชำระ</Story>

<Story name="Outline" args={{ variant: 'outline' }}>ปิดแล้ว</Story>
