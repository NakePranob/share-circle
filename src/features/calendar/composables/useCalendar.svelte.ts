import { SvelteDate } from 'svelte/reactivity';
import type { Group, Wallet, DayData } from '$features/shared/types';
import { buildCashFlow, buildPaidCashFlow } from '$features/calendar/utils/cashflow';
import { toISODate } from '$features/shared/utils/dateHelpers';

export function useCalendar(getGroups: () => Group[], wallet: Wallet) {
	const _now = new SvelteDate();
	let viewYear = $state(_now.getFullYear());
	let viewMonth = $state(_now.getMonth()); // 0-indexed
	let selectedDay = $state<DayData | null>(null);

	const cashFlow = $derived(buildCashFlow(getGroups(), wallet, viewYear, viewMonth));
	const paidCashFlow = $derived(buildPaidCashFlow(getGroups(), wallet, viewYear, viewMonth));

	const calendarDays = $derived.by(() => {
		const firstDay = new SvelteDate(viewYear, viewMonth, 1).getDay(); // 0=Sun
		const daysInMonth = new SvelteDate(viewYear, viewMonth + 1, 0).getDate();
		const cells: Array<{ date: string; day: number } | null> = [];

		for (let i = 0; i < firstDay; i++) cells.push(null);
		for (let d = 1; d <= daysInMonth; d++) {
			const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
			cells.push({ date: dateStr, day: d });
		}
		return cells;
	});

	const monthLabel = $derived(
		new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(
			new SvelteDate(viewYear, viewMonth, 1)
		)
	);

	const todayStr = toISODate(new SvelteDate());

	function prevMonth() {
		if (viewMonth === 0) {
			viewYear -= 1;
			viewMonth = 11;
		} else {
			viewMonth -= 1;
		}
	}

	function nextMonth() {
		if (viewMonth === 11) {
			viewYear += 1;
			viewMonth = 0;
		} else {
			viewMonth += 1;
		}
	}

	function clickDay(dateStr: string) {
		const data = cashFlow.get(dateStr);
		if (data) {
			selectedDay = data;
		} else {
			selectedDay = {
				date: dateStr,
				balance: 0,
				transactions: [],
				hasNegativeBalance: false
			};
		}
	}

	return {
		get viewYear() { return viewYear; },
		get viewMonth() { return viewMonth; },
		get cashFlow() { return cashFlow; },
		get paidCashFlow() { return paidCashFlow; },
		get calendarDays() { return calendarDays; },
		get monthLabel() { return monthLabel; },
		get selectedDay() { return selectedDay; },
		set selectedDay(v: DayData | null) { selectedDay = v; },
		todayStr,
		prevMonth,
		nextMonth,
		clickDay
	};
}
