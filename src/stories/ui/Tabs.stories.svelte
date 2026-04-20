<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';

	const { Story } = defineMeta({
		component: Tabs,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			value: {
				control: { type: 'text' }
			}
		}
	});
</script>

<Story name="Default">
	<div class="w-96">
		<Tabs value="tab1">
			<TabsList>
				<TabsTrigger value="tab1">แท็บ 1</TabsTrigger>
				<TabsTrigger value="tab2">แท็บ 2</TabsTrigger>
				<TabsTrigger value="tab3">แท็บ 3</TabsTrigger>
			</TabsList>
			<TabsContent value="tab1">
				<p class="p-4">เนื้อหาแท็บ 1</p>
			</TabsContent>
			<TabsContent value="tab2">
				<p class="p-4">เนื้อหาแท็บ 2</p>
			</TabsContent>
			<TabsContent value="tab3">
				<p class="p-4">เนื้อหาแท็บ 3</p>
			</TabsContent>
		</Tabs>
	</div>
</Story>

<Story name="Vertical">
	<div class="flex w-96">
		<Tabs value="tab1" orientation="vertical">
			<TabsList>
				<TabsTrigger value="tab1">แท็บ 1</TabsTrigger>
				<TabsTrigger value="tab2">แท็บ 2</TabsTrigger>
				<TabsTrigger value="tab3">แท็บ 3</TabsTrigger>
			</TabsList>
			<TabsContent value="tab1">
				<p class="p-4">เนื้อหาแท็บ 1</p>
			</TabsContent>
			<TabsContent value="tab2">
				<p class="p-4">เนื้อหาแท็บ 2</p>
			</TabsContent>
			<TabsContent value="tab3">
				<p class="p-4">เนื้อหาแท็บ 3</p>
			</TabsContent>
		</Tabs>
	</div>
</Story>

<Story name="WithCard">
	<div class="w-96">
		<Tabs value="account">
			<TabsList class="grid w-full grid-cols-2">
				<TabsTrigger value="account">บัญชี</TabsTrigger>
				<TabsTrigger value="password">รหัสผ่าน</TabsTrigger>
			</TabsList>
			<TabsContent value="account" class="space-y-2">
				<p class="p-4">จัดการข้อมูลบัญชีของคุณ</p>
			</TabsContent>
			<TabsContent value="password" class="space-y-2">
				<p class="p-4">เปลี่ยนรหัสผ่านของคุณ</p>
			</TabsContent>
		</Tabs>
	</div>
</Story>
