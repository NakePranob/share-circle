<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TransactionTable from '$features/audit/components/TransactionTable.svelte';
	import { transactions } from './groupFixtures';

	const { Story } = defineMeta({
		title: 'Features/TransactionTable',
		component: TransactionTable,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

<Story name="WithTransactions">
	<TransactionTable {transactions} />
</Story>

<Story name="Empty">
	<TransactionTable transactions={[]} />
</Story>

<Story name="SingleRow">
	<TransactionTable transactions={[transactions[1]]} />
</Story>
