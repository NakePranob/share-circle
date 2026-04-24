<script lang="ts">
	import { useAuditLog } from '$features/audit/composables';
	import TransactionTable from '$features/audit/components/TransactionTable.svelte';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { History, Wallet, Users } from '@lucide/svelte';

	const auditLog = useAuditLog();
	const manualTransactions = $derived(auditLog.manualTransactions);
	const groupTransactions = $derived(auditLog.groupTransactions);
	const allTransactions = $derived(auditLog.allTransactions);
</script>

<div class="p-4">
	<header class="mb-4 flex items-center gap-2">
		<History class="h-5 w-5" />
		<h1 class="text-xl font-bold">บันทึกการเติม/เบิก</h1>
	</header>

	{#if manualTransactions.length === 0 && groupTransactions.length === 0}
		<div class="flex flex-col items-center justify-center py-16 text-center">
			<History class="mb-4 h-12 w-12 text-muted-foreground/40" />
			<p class="text-sm text-muted-foreground">ยังไม่มีรายการ</p>
		</div>
	{:else}
		<Tabs value="all">
			<TabsList class="w-full space-x-1">
				<TabsTrigger value="all" class="flex-1 bg-background rounded-e">
					รวม ({allTransactions.length})
				</TabsTrigger>
				<TabsTrigger value="manual" class="flex-1 bg-background rounded-none">
					เติม/เบิก ({manualTransactions.length})
				</TabsTrigger>
				<TabsTrigger value="groups" class="flex-1 bg-background rounded-s">
					วงแชร์ ({groupTransactions.length})
				</TabsTrigger>
			</TabsList>

			<TabsContent value="all" class="mt-4">
				{#if allTransactions.length === 0}
					<div class="flex flex-col items-center justify-center py-16 text-center">
						<History class="mb-4 h-12 w-12 text-muted-foreground/40" />
						<p class="text-sm text-muted-foreground">ยังไม่มีรายการ</p>
					</div>
				{:else}
					<TransactionTable transactions={allTransactions} />
				{/if}
			</TabsContent>

			<TabsContent value="manual" class="mt-4">
				{#if manualTransactions.length === 0}
					<div class="flex flex-col items-center justify-center py-16 text-center">
						<Wallet class="mb-4 h-12 w-12 text-muted-foreground/40" />
						<p class="text-sm text-muted-foreground">ยังไม่มีรายการเติม/เบิก</p>
					</div>
				{:else}
					<TransactionTable transactions={manualTransactions} />
				{/if}
			</TabsContent>

			<TabsContent value="groups" class="mt-4">
				{#if groupTransactions.length === 0}
					<div class="flex flex-col items-center justify-center py-16 text-center">
						<Users class="mb-4 h-12 w-12 text-muted-foreground/40" />
						<p class="text-sm text-muted-foreground">ยังไม่มีรายการจากวงแชร์</p>
					</div>
				{:else}
					<TransactionTable transactions={groupTransactions} />
				{/if}
			</TabsContent>
		</Tabs>
	{/if}
</div>
