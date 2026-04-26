<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Toaster } from '$lib/components/ui/sonner';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';

	const { Story } = defineMeta({
		component: Toaster,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			theme: {
				control: { type: 'select' },
				options: ['light', 'dark', 'system']
			}
		}
	});
</script>

<Story name="Default">
	<div class="flex flex-col gap-4">
		<Toaster />
		<Button onclick={() => toast('ข้อความแจ้งเตือน')}>แสดง Toast</Button>
	</div>
</Story>

<Story name="Success">
	<div class="flex flex-col gap-4">
		<Toaster />
		<Button onclick={() => toast.success('บันทึกข้อมูลสำเร็จ')}>แสดง Success</Button>
	</div>
</Story>

<Story name="Error">
	<div class="flex flex-col gap-4">
		<Toaster />
		<Button onclick={() => toast.error('เกิดข้อผิดพลาด')}>แสดง Error</Button>
	</div>
</Story>

<Story name="Warning">
	<div class="flex flex-col gap-4">
		<Toaster />
		<Button onclick={() => toast.warning('คำเตือน')}>แสดง Warning</Button>
	</div>
</Story>

<Story name="Info">
	<div class="flex flex-col gap-4">
		<Toaster />
		<Button onclick={() => toast.info('ข้อมูลเพิ่มเติม')}>แสดง Info</Button>
	</div>
</Story>

<Story name="WithAction">
	<div class="flex flex-col gap-4">
		<Toaster />
		<Button
			onclick={() =>
				toast('ข้อความแจ้งเตือน', {
					action: {
						label: 'ดำเนินการ',
						onClick: () => console.log('Action clicked')
					}
				})}
		>
			แสดง Toast พร้อม Action
		</Button>
	</div>
</Story>

<Story name="Multiple">
	<div class="flex flex-col gap-4">
		<Toaster />
		<div class="flex gap-2">
			<Button onclick={() => toast.success('สำเร็จ')}>Success</Button>
			<Button onclick={() => toast.error('ผิดพลาด')}>Error</Button>
			<Button onclick={() => toast.info('ข้อมูล')}>Info</Button>
		</div>
	</div>
</Story>
