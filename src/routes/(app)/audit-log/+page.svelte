<script lang="ts">
	import { useAuditLog } from '$features/audit/composables';
	import { useWalletStore } from '$features/wallet/stores/wallet.svelte';
	import TransactionTable from '$features/audit/components/TransactionTable.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { History, Wallet, Users, Loader2 } from '@lucide/svelte';

	const auditLog = useAuditLog();
	const walletStore = useWalletStore();
	const manualTransactions = $derived(auditLog.manualTransactions);
	const groupTransactions = $derived(auditLog.groupTransactions);
	const allTransactions = $derived(auditLog.allTransactions);
	const hasMore = $derived(walletStore.hasMoreTransactions);
	const loading = $derived(walletStore.loading);

	function loadMore() {
		walletStore.loadMoreTransactions();
	}
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
				<TabsTrigger value="all" class="flex-1 rounded-e bg-background">
					รวม ({allTransactions.length})
				</TabsTrigger>
				<TabsTrigger value="manual" class="flex-1 rounded-none bg-background">
					เติม/เบิก ({manualTransactions.length})
				</TabsTrigger>
				<TabsTrigger value="groups" class="flex-1 rounded-s bg-background">
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
					{#if hasMore}
						<div class="mt-4 flex justify-center">
							<Button variant="outline" onclick={loadMore} disabled={loading}>
								{#if loading}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{/if}
								โหลดเพิ่ม
							</Button>
						</div>
					{/if}
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
					{#if hasMore}
						<div class="mt-4 flex justify-center">
							<Button variant="outline" onclick={loadMore} disabled={loading}>
								{#if loading}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{/if}
								โหลดเพิ่ม
							</Button>
						</div>
					{/if}
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
					{#if hasMore}
						<div class="mt-4 flex justify-center">
							<Button variant="outline" onclick={loadMore} disabled={loading}>
								{#if loading}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{/if}
								โหลดเพิ่ม
							</Button>
						</div>
					{/if}
				{/if}
			</TabsContent>
		</Tabs>
	{/if}
</div>
