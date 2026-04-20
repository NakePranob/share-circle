<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	const { Story } = defineMeta({
		component: Dialog,
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
	<Dialog open={true}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>สร้างวงแชร์ใหม่</DialogTitle>
				<DialogDescription>
					กรอกข้อมูลเพื่อเริ่มวงแชร์ใหม่
				</DialogDescription>
			</DialogHeader>
			<div class="grid gap-4 py-4">
				<div class="grid gap-2">
					<Label for="name">ชื่อวงแชร์</Label>
					<Input id="name" placeholder="วงแชร์บ้าน" />
				</div>
				<div class="grid gap-2">
					<Label for="hands">จำนวนมือ</Label>
					<Input id="hands" type="number" placeholder="10" />
				</div>
			</div>
			<DialogFooter>
				<Button variant="outline">ยกเลิก</Button>
				<Button>สร้าง</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</Story>

<Story name="WithTrigger">
	<Dialog>
		<DialogTrigger>
			<Button>เปิด Dialog</Button>
		</DialogTrigger>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>แก้ไขข้อมูล</DialogTitle>
				<DialogDescription>
					แก้ไขข้อมูลส่วนตัวของคุณ
				</DialogDescription>
			</DialogHeader>
			<div class="grid gap-4 py-4">
				<div class="grid gap-2">
					<Label for="username">ชื่อผู้ใช้</Label>
					<Input id="username" placeholder="ชื่อผู้ใช้" />
				</div>
				<div class="grid gap-2">
					<Label for="email">อีเมล</Label>
					<Input id="email" type="email" placeholder="name@example.com" />
				</div>
			</div>
			<DialogFooter>
				<Button variant="outline">ยกเลิก</Button>
				<Button>บันทึก</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</Story>
