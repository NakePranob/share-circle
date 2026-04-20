<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogTrigger
	} from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';

	const { Story } = defineMeta({
		component: AlertDialog,
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
	<AlertDialog open={true}>
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
				<AlertDialogDescription>
					การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลจะถูกลบถาวร
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel>ยกเลิก</AlertDialogCancel>
				<AlertDialogAction>ดำเนินการต่อ</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
</Story>

<Story name="WithTrigger">
	<AlertDialog>
		<AlertDialogTrigger>
			<Button>ลบข้อมูล</Button>
		</AlertDialogTrigger>
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
				<AlertDialogDescription>
					คุณต้องการลบวงแชร์นี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel>ยกเลิก</AlertDialogCancel>
				<AlertDialogAction variant="destructive">ลบ</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
</Story>
