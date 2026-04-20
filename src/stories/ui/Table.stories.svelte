<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import {
		Table,
		TableBody,
		TableCaption,
		TableCell,
		TableFooter,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';

	const { Story } = defineMeta({
		component: Table,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			class: {
				control: { type: 'text' }
			}
		}
	});
</script>

<Story name="Default">
	<div class="w-96">
		<Table>
			<TableCaption>รายการวงแชร์</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>ชื่อ</TableHead>
					<TableHead>มือ</TableHead>
					<TableHead>ยอด</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>วงแชร์บ้าน</TableCell>
					<TableCell>10</TableCell>
					<TableCell>฿10,000</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>วงแชร์ออฟฟิศ</TableCell>
					<TableCell>5</TableCell>
					<TableCell>฿5,000</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	</div>
</Story>

<Story name="WithFooter">
	<div class="w-96">
		<Table>
			<TableCaption>รายการรายจ่าย</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>รายการ</TableHead>
					<TableHead class="text-right">จำนวน</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>ค่าอาหาร</TableCell>
					<TableCell class="text-right">฿500</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>ค่าเดินทาง</TableCell>
					<TableCell class="text-right">฿200</TableCell>
				</TableRow>
			</TableBody>
			<TableFooter>
				<TableRow>
					<TableCell>รวมทั้งหมด</TableCell>
					<TableCell class="text-right">฿700</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	</div>
</Story>

<Story name="Striped">
	<div class="w-96">
		<Table>
			<TableCaption>รายชื่อสมาชิก</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>ชื่อ</TableHead>
					<TableHead>อีเมล</TableHead>
					<TableHead>สถานะ</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow class="hover:bg-muted/50 data-[state=selected]:bg-muted">
					<TableCell>สมชาย</TableCell>
					<TableCell>somchai@example.com</TableCell>
					<TableCell>ใช้งาน</TableCell>
				</TableRow>
				<TableRow class="hover:bg-muted/50 data-[state=selected]:bg-muted">
					<TableCell>สมหญิง</TableCell>
					<TableCell>somying@example.com</TableCell>
					<TableCell>ใช้งาน</TableCell>
				</TableRow>
				<TableRow class="hover:bg-muted/50 data-[state=selected]:bg-muted">
					<TableCell>สมศรี</TableCell>
					<TableCell>somsri@example.com</TableCell>
					<TableCell>ไม่ได้ใช้งาน</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	</div>
</Story>
