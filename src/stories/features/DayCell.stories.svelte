<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DayCell from '$features/calendar/components/DayCell.svelte';
	import { fn } from 'storybook/test';

	const { Story } = defineMeta({
		title: 'Features/DayCell',
		component: DayCell,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			cell: { date: '2026-01-15', day: 15 },
			dayData: undefined,
			paidDayData: undefined,
			isToday: false,
			isLastRow: false,
			isSaturday: false,
			onclick: fn()
		}
	});
</script>

<Story name="Empty" />

<Story name="Today" args={{ isToday: true }} />

<Story
	name="WithTransactions"
	args={{
		dayData: {
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
				}
			],
			hasNegativeBalance: false
		}
	}}
/>

<Story
	name="NegativeBalance"
	args={{
		dayData: {
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
