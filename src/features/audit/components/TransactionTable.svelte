<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { formatCurrency } from '$lib/utils/calculator';
	import { txnLabel, txnColor, formatDate } from '$features/audit/utils/formatters';

	interface Props {
		transactions: Array<{
			transaction: import('$features/wallet/types').Transaction;
			groupName?: string;
		}>;
	}

	let { transactions }: Props = $props();
</script>

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
			{#each transactions as { transaction, groupName } (transaction.id)}
				<TableRow>
					<TableCell class="text-sm text-muted-foreground">{formatDate(transaction.date)}</TableCell
					>
					<TableCell>
						<Badge variant={txnColor(transaction.type)} class="text-xs">
							{txnLabel(transaction.type)}
						</Badge>
					</TableCell>
					<TableCell class="text-sm">{transaction.note || groupName || '—'}</TableCell>
					<TableCell
						class="text-right font-medium {transaction.type === 'payment' ||
						transaction.type === 'withdrawal'
							? 'text-red-500'
							: 'text-green-600 dark:text-green-400'}"
					>
						{transaction.type === 'payment' || transaction.type === 'withdrawal' ? '-' : '+'}
						{formatCurrency(transaction.amount)}
					</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
</div>
