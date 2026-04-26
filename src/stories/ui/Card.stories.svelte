<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent,
		CardFooter,
		CardAction
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	const { Story } = defineMeta({
		component: Card,
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
	<Card class="w-80">
		<CardHeader>
			<CardTitle>วงแชร์บ้าน 2569</CardTitle>
			<CardDescription>10 มือ · ทุก 30 วัน</CardDescription>
		</CardHeader>
		<CardContent>
			<p class="text-sm text-muted-foreground">เริ่มต้น 1 ม.ค. 2569</p>
		</CardContent>
	</Card>
</Story>

<Story name="WithFooter">
	<Card class="w-80">
		<CardHeader>
			<CardTitle>ยอดกระเป๋า</CardTitle>
			<CardDescription>อัปเดตล่าสุดวันนี้</CardDescription>
		</CardHeader>
		<CardContent>
			<p class="text-2xl font-bold text-green-600">฿ 12,500</p>
		</CardContent>
		<CardFooter>
			<Button variant="outline" class="w-full">ดูประวัติ</Button>
		</CardFooter>
	</Card>
</Story>

<Story name="WithAction">
	<Card class="w-80">
		<CardHeader>
			<CardTitle>วงแชร์ออฟฟิศ</CardTitle>
			<CardDescription>5 มือ · รายเดือน</CardDescription>
			<CardAction>
				<Badge variant="secondary">ใช้งาน</Badge>
			</CardAction>
		</CardHeader>
		<CardContent>
			<p class="text-sm text-muted-foreground">จ่ายมือละ ฿1,000</p>
		</CardContent>
	</Card>
</Story>

<Story name="Small">
	<Card class="w-80">
		<CardHeader>
			<CardTitle>Card เล็ก</CardTitle>
		</CardHeader>
		<CardContent>
			<p class="text-sm">ใช้ size="sm" สำหรับ card ขนาดกะทัดรัด</p>
		</CardContent>
	</Card>
</Story>
