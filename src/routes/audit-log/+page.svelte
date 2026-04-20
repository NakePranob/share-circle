<script lang="ts">
	import { groupsStore } from '$features/groups/stores/groups.svelte';
	import { walletStore } from '$features/wallet/stores/wallet.svelte';
	import { paidTransactions } from '$lib/utils/cashflow';
	import { formatCurrency } from '$lib/utils/calculator';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { History, Wallet, Users } from '@lucide/svelte';

	const groups = $derived(groupsStore.groups);
	const wallet = $derived(walletStore.wallet);

	// Manual transactions (deposit/withdrawal)
	const manualTransactions = $derived(() => {
		return wallet.manualTransactions
			.map((t) => ({ transaction: t, groupName: undefined }))
			.sort((a, b) => b.transaction.date.localeCompare(a.transaction.date));
	});

	// Group transactions (payment/payout)
	const groupTransactions = $derived(() => {
		const groupMap = new Map(groups.map((g) => [g.id, g.name]));
		return paidTransactions(groups)
			.map((t) => ({
				transaction: t,
				groupName: t.groupId ? groupMap.get(t.groupId) : undefined
			}))
			.sort((a, b) => b.transaction.date.localeCompare(a.transaction.date));
	});

	// All transactions combined
	const allTransactions = $derived(() => {
		return [...manualTransactions(), ...groupTransactions()].sort(
			(a, b) => b.transaction.date.localeCompare(a.transaction.date)
		);
	});

	function txnLabel(type: string) {
		if (type === 'payment') return 'จ่าย';
		if (type === 'payout') return 'รับ';
		if (type === 'deposit') return 'เติม';
		if (type === 'withdrawal') return 'เบิก';
		return type;
	}

	function txnColor(type: string) {
		if (type === 'payment') return 'destructive';
		if (type === 'payout') return 'default';
		if (type === 'deposit') return 'default';
		if (type === 'withdrawal') return 'destructive';
		return 'outline';
	}

	function formatDate(dateStr: string) {
		return new Intl.DateTimeFormat('th-TH', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(new Date(dateStr));
	}
</script>

<div class="p-4">
	<header class="mb-4 flex items-center gap-2">
		<History class="h-5 w-5" />
		<h1 class="text-xl font-bold">บันทึกการเติม/เบิก</h1>
	</header>

	{#if manualTransactions().length === 0 && groupTransactions().length === 0}
		<div class="flex flex-col items-center justify-center py-16 text-center">
			<History class="mb-4 h-12 w-12 text-muted-foreground/40" />
			<p class="text-sm text-muted-foreground">ยังไม่มีรายการ</p>
		</div>
	{:else}
		<Tabs value="all">
			<TabsList class="w-full space-x-1">
				<TabsTrigger value="all" class="flex-1 bg-background">
					รวม ({allTransactions().length})
				</TabsTrigger>
				<TabsTrigger value="manual" class="flex-1 bg-background">
					เติม/เบิก ({manualTransactions().length})
				</TabsTrigger>
				<TabsTrigger value="groups" class="flex-1 bg-background">
					วงแชร์ ({groupTransactions().length})
				</TabsTrigger>
			</TabsList>

			<TabsContent value="all" class="mt-4">
				{#if allTransactions().length === 0}
					<div class="flex flex-col items-center justify-center py-16 text-center">
						<History class="mb-4 h-12 w-12 text-muted-foreground/40" />
						<p class="text-sm text-muted-foreground">ยังไม่มีรายการ</p>
					</div>
				{:else}
					<div class="rounded-lg border border-border bg-card">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead class="w-[120px]">วันที่</TableHead>
									<TableHead>ประเภท</TableHead>
									<TableHead>รายละเอียด</TableHead>
									<TableHead class="text-right">จำนวน</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each allTransactions() as { transaction, groupName } (transaction.id)}
									<TableRow>
										<TableCell class="text-sm text-muted-foreground">{formatDate(transaction.date)}</TableCell>
										<TableCell>
											<Badge variant={txnColor(transaction.type)} class="text-xs">
												{txnLabel(transaction.type)}
											</Badge>
										</TableCell>
										<TableCell class="text-sm">{transaction.note || groupName || '—'}</TableCell>
										<TableCell class="text-right font-medium {transaction.type === 'payment' || transaction.type === 'withdrawal' ? 'text-red-500' : 'text-green-600 dark:text-green-400'}">
											{transaction.type === 'payment' || transaction.type === 'withdrawal' ? '-' : '+'}
											{formatCurrency(transaction.amount)}
										</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					</div>
				{/if}
			</TabsContent>

			<TabsContent value="manual" class="mt-4">
				{#if manualTransactions().length === 0}
					<div class="flex flex-col items-center justify-center py-16 text-center">
						<Wallet class="mb-4 h-12 w-12 text-muted-foreground/40" />
						<p class="text-sm text-muted-foreground">ยังไม่มีรายการเติม/เบิก</p>
					</div>
				{:else}
					<div class="rounded-lg border border-border bg-card">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead class="w-[120px]">วันที่</TableHead>
									<TableHead>ประเภท</TableHead>
									<TableHead>รายละเอียด</TableHead>
									<TableHead class="text-right">จำนวน</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each manualTransactions() as { transaction } (transaction.id)}
									<TableRow>
										<TableCell class="text-sm text-muted-foreground">{formatDate(transaction.date)}</TableCell>
										<TableCell>
											<Badge variant={txnColor(transaction.type)} class="text-xs">
												{txnLabel(transaction.type)}
											</Badge>
										</TableCell>
										<TableCell class="text-sm">{transaction.note || '—'}</TableCell>
										<TableCell class="text-right font-medium {transaction.type === 'payment' || transaction.type === 'withdrawal' ? 'text-red-500' : 'text-green-600 dark:text-green-400'}">
											{transaction.type === 'payment' || transaction.type === 'withdrawal' ? '-' : '+'}
											{formatCurrency(transaction.amount)}
										</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					</div>
				{/if}
			</TabsContent>

			<TabsContent value="groups" class="mt-4">
				{#if groupTransactions().length === 0}
					<div class="flex flex-col items-center justify-center py-16 text-center">
						<Users class="mb-4 h-12 w-12 text-muted-foreground/40" />
						<p class="text-sm text-muted-foreground">ยังไม่มีรายการจากวงแชร์</p>
					</div>
				{:else}
					<div class="rounded-lg border border-border bg-card">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead class="w-[120px]">วันที่</TableHead>
									<TableHead>ประเภท</TableHead>
									<TableHead>รายละเอียด</TableHead>
									<TableHead class="text-right">จำนวน</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each groupTransactions() as { transaction, groupName } (transaction.id)}
									<TableRow>
										<TableCell class="text-sm text-muted-foreground">{formatDate(transaction.date)}</TableCell>
										<TableCell>
											<Badge variant={txnColor(transaction.type)} class="text-xs">
												{txnLabel(transaction.type)}
											</Badge>
										</TableCell>
										<TableCell class="text-sm">{transaction.note || groupName || '—'}</TableCell>
										<TableCell class="text-right font-medium {transaction.type === 'payment' || transaction.type === 'withdrawal' ? 'text-red-500' : 'text-green-600 dark:text-green-400'}">
											{transaction.type === 'payment' || transaction.type === 'withdrawal' ? '-' : '+'}
											{formatCurrency(transaction.amount)}
										</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					</div>
				{/if}
			</TabsContent>
		</Tabs>
	{/if}
</div>
