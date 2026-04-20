<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import {
		Select,
		SelectContent,
		SelectGroup,
		SelectItem,
		SelectLabel,
		SelectSeparator,
		SelectTrigger
	} from '$lib/components/ui/select';
	import { Label } from '$lib/components/ui/label';

	const { Story } = defineMeta({
		component: Select,
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
	<div class="w-72">
		<Select type="single">
			<SelectTrigger>
				เลือกตัวเลือก
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="option1">ตัวเลือกที่ 1</SelectItem>
				<SelectItem value="option2">ตัวเลือกที่ 2</SelectItem>
				<SelectItem value="option3">ตัวเลือกที่ 3</SelectItem>
			</SelectContent>
		</Select>
	</div>
</Story>

<Story name="WithLabel">
	<div class="grid w-72 items-center gap-2">
		<Label for="framework">เฟรมเวิร์ก</Label>
		<Select type="single">
			<SelectTrigger id="framework">
				เลือกเฟรมเวิร์ก
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="svelte">Svelte</SelectItem>
				<SelectItem value="react">React</SelectItem>
				<SelectItem value="vue">Vue</SelectItem>
				<SelectItem value="angular">Angular</SelectItem>
			</SelectContent>
		</Select>
	</div>
</Story>

<Story name="WithGroups">
	<div class="w-72">
		<Select type="single">
			<SelectTrigger>
				เลือกหมวดหมู่
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>ผัก</SelectLabel>
					<SelectItem value="carrot">แครอท</SelectItem>
					<SelectItem value="broccoli">บรอคโคลี</SelectItem>
					<SelectItem value="spinach">ผักกาดขาว</SelectItem>
				</SelectGroup>
				<SelectSeparator />
				<SelectGroup>
					<SelectLabel>ผลไม้</SelectLabel>
					<SelectItem value="apple">แอปเปิ้ล</SelectItem>
					<SelectItem value="banana">กล้วย</SelectItem>
					<SelectItem value="orange">ส้ม</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	</div>
</Story>

<Story name="WithPlaceholder">
	<div class="w-72">
		<Select type="single">
			<SelectTrigger placeholder="เลือกวันที่" />
			<SelectContent>
				<SelectItem value="today">วันนี้</SelectItem>
				<SelectItem value="tomorrow">พรุ่งนี้</SelectItem>
				<SelectItem value="week">สัปดาห์หน้า</SelectItem>
			</SelectContent>
		</Select>
	</div>
</Story>

<Story name="Form">
	<div class="grid w-72 gap-4">
		<div class="grid gap-2">
			<Label for="status">สถานะ</Label>
			<Select type="single">
				<SelectTrigger id="status">
					เลือกสถานะ
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="active">ใช้งานอยู่</SelectItem>
					<SelectItem value="inactive">ไม่ได้ใช้งาน</SelectItem>
					<SelectItem value="pending">รอดำเนินการ</SelectItem>
				</SelectContent>
			</Select>
		</div>
		<div class="grid gap-2">
			<Label for="priority">ความสำคัญ</Label>
			<Select type="single">
				<SelectTrigger id="priority">
					เลือกความสำคัญ
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="high">สูง</SelectItem>
					<SelectItem value="medium">ปานกลาง</SelectItem>
					<SelectItem value="low">ต่ำ</SelectItem>
				</SelectContent>
			</Select>
		</div>
	</div>
</Story>
