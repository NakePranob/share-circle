<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Button } from '$lib/components/ui/button';

	const { Story } = defineMeta({
		component: Button,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link']
			},
			size: {
				control: { type: 'select' },
				options: ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg', 'xs', 'icon-xs']
			},
			disabled: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story name="Default" args={{ variant: 'default' }}>ยืนยัน</Story>

<Story name="Outline" args={{ variant: 'outline' }}>ยกเลิก</Story>

<Story name="Secondary" args={{ variant: 'secondary' }}>รายละเอียด</Story>

<Story name="Ghost" args={{ variant: 'ghost' }}>ดูเพิ่มเติม</Story>

<Story name="Destructive" args={{ variant: 'destructive' }}>ลบ</Story>

<Story name="Link" args={{ variant: 'link' }}>ลิงก์</Story>

<Story name="Small" args={{ size: 'sm' }}>เล็ก</Story>

<Story name="Large" args={{ size: 'lg' }}>ใหญ่</Story>

<Story name="Disabled" args={{ disabled: true }}>ปิดใช้งาน</Story>
