<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CalendarGrid from '$features/calendar/components/CalendarGrid.svelte';
	import { fn } from 'storybook/test';

	const { Story } = defineMeta({
		title: 'Features/CalendarGrid',
		component: CalendarGrid,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			calendarDays: [],
			monthLabel: 'มกราคม 2569',
			cashFlow: new Map(),
			paidCashFlow: new Map(),
			todayStr: '2026-01-15',
			onPrevMonth: fn(),
			onNextMonth: fn(),
			onClickDay: fn()
		}
	});
</script>

<Story name="Empty" />

<Story name="WithDays"
	args={{
		calendarDays: [
			{ date: '2026-01-01', day: 1 },
			{ date: '2026-01-02', day: 2 },
			{ date: '2026-01-03', day: 3 },
			null,
			{ date: '2026-01-05', day: 5 },
			{ date: '2026-01-06', day: 6 },
			{ date: '2026-01-07', day: 7 }
		]
	}}
/>
