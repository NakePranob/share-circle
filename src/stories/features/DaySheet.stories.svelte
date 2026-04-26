<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DaySheet from '$features/calendar/components/DaySheet.svelte';
	import { fn } from 'storybook/test';

	const { Story } = defineMeta({
		title: 'Features/DaySheet',
		component: DaySheet,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			selectedDay: null,
			open: false,
			paidCashFlow: new Map(),
			onClose: fn(),
			onMarkAsPaid: fn()
		}
	});
</script>

<Story name="Closed" args={{ open: false }} />

<Story
	name="OpenEmpty"
	args={{
		open: true,
		selectedDay: {
			date: '2026-01-15',
			balance: 0,
			transactions: [],
			hasNegativeBalance: false
		}
	}}
/>

<Story
	name="OpenWithTransactions"
	args={{
		open: true,
		selectedDay: {
			date: '2026-01-15',
			balance: 5000,
			transactions: [
				{
					transaction: {
						id: '1',
						type: 'payment',
						amount: 1000,
						date: '2026-01-15',
						note: 'จ่ายแชร์',
						isEstimate: false,
						groupId: 'group1',
						roundNumber: 1
					}
				},
				{
					transaction: {
						id: '2',
						type: 'payout',
						amount: 5000,
						date: '2026-01-15',
						note: 'รับแชร์',
						isEstimate: false,
						groupId: 'group1',
						roundNumber: 2
					}
				}
			],
			hasNegativeBalance: false
		}
	}}
/>

<Story
	name="NegativeBalance"
	args={{
		open: true,
		selectedDay: {
			date: '2026-01-15',
			balance: -2000,
			transactions: [
				{
					transaction: {
						id: '1',
						type: 'payment',
						amount: 2000,
						date: '2026-01-15',
						note: 'จ่ายแชร์',
						isEstimate: false,
						groupId: 'group1',
						roundNumber: 1
					}
				}
			],
			hasNegativeBalance: true
		}
	}}
/>
