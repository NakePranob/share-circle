<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import {
		Sheet,
		SheetClose,
		SheetContent,
		SheetDescription,
		SheetFooter,
		SheetHeader,
		SheetTitle,
		SheetTrigger
	} from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';

	const { Story } = defineMeta({
		component: Sheet,
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
	<Sheet open={true}>
		<SheetContent side="right">
			<SheetHeader>
				<SheetTitle>แก้ไขโปรไฟล์</SheetTitle>
				<SheetDescription>แก้ไขข้อมูลส่วนตัวของคุณ</SheetDescription>
			</SheetHeader>
			<div class="py-4">
				<p>เนื้อหาของ Sheet</p>
			</div>
			<SheetFooter>
				<SheetClose>
					<Button variant="outline">ปิด</Button>
				</SheetClose>
			</SheetFooter>
		</SheetContent>
	</Sheet>
</Story>

<Story name="LeftSide">
	<Sheet open={true}>
		<SheetContent side="left">
			<SheetHeader>
				<SheetTitle>เมนู</SheetTitle>
				<SheetDescription>เลือกเมนูที่ต้องการ</SheetDescription>
			</SheetHeader>
			<div class="space-y-2 py-4">
				<Button variant="ghost" class="w-full justify-start">โปรไฟล์</Button>
				<Button variant="ghost" class="w-full justify-start">ตั้งค่า</Button>
				<Button variant="ghost" class="w-full justify-start">ออกจากระบบ</Button>
			</div>
			<SheetFooter>
				<SheetClose>
					<Button variant="outline">ปิด</Button>
				</SheetClose>
			</SheetFooter>
		</SheetContent>
	</Sheet>
</Story>

<Story name="WithTrigger">
	<Sheet>
		<SheetTrigger>
			<Button>เปิด Sheet</Button>
		</SheetTrigger>
		<SheetContent side="right">
			<SheetHeader>
				<SheetTitle>สร้างวงแชร์</SheetTitle>
				<SheetDescription>กรอกข้อมูลเพื่อเริ่มวงแชร์ใหม่</SheetDescription>
			</SheetHeader>
			<div class="space-y-4 py-4">
				<p>เนื้อหาของ Sheet</p>
			</div>
			<SheetFooter>
				<SheetClose>
					<Button variant="outline">ยกเลิก</Button>
				</SheetClose>
				<Button>สร้าง</Button>
			</SheetFooter>
		</SheetContent>
	</Sheet>
</Story>
