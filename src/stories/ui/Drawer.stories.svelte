<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import {
		Drawer,
		DrawerClose,
		DrawerContent,
		DrawerDescription,
		DrawerFooter,
		DrawerHeader,
		DrawerTitle,
		DrawerTrigger
	} from '$lib/components/ui/drawer';
	import { Button } from '$lib/components/ui/button';

	const { Story } = defineMeta({
		component: Drawer,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			open: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story name="Default">
	<Drawer open={true}>
		<DrawerContent>
			<DrawerHeader>
				<DrawerTitle>ตั้งค่า</DrawerTitle>
				<DrawerDescription>ปรับแต่งการตั้งค่าของคุณ</DrawerDescription>
			</DrawerHeader>
			<div class="p-4">
				<p>เนื้อหาของ Drawer</p>
			</div>
			<DrawerFooter>
				<DrawerClose>
					<Button variant="outline">ปิด</Button>
				</DrawerClose>
			</DrawerFooter>
		</DrawerContent>
	</Drawer>
</Story>

<Story name="WithTrigger">
	<Drawer>
		<DrawerTrigger>
			<Button>เปิด Drawer</Button>
		</DrawerTrigger>
		<DrawerContent>
			<DrawerHeader>
				<DrawerTitle>เมนู</DrawerTitle>
				<DrawerDescription>เลือกเมนูที่ต้องการ</DrawerDescription>
			</DrawerHeader>
			<div class="space-y-2 p-4">
				<Button variant="ghost" class="w-full justify-start">โปรไฟล์</Button>
				<Button variant="ghost" class="w-full justify-start">ตั้งค่า</Button>
				<Button variant="ghost" class="w-full justify-start">ออกจากระบบ</Button>
			</div>
			<DrawerFooter>
				<DrawerClose>
					<Button variant="outline">ปิด</Button>
				</DrawerClose>
			</DrawerFooter>
		</DrawerContent>
	</Drawer>
</Story>
