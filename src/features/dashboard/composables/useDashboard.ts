import { buildCashFlow, buildPaidCashFlow, getUpcomingPayments, getUpcomingPayouts } from '$features/calendar/utils/cashflow';
import type { Group, Wallet } from '$features/shared/types';

export function useDashboard(getGroups: () => Group[], wallet: Wallet, year: number, month: number) {
	const groups = getGroups();
	const cashFlow = buildCashFlow(groups, wallet, year, month);
	const paidCashFlow = buildPaidCashFlow(groups, wallet, year, month);

	const upcomingPayments = getUpcomingPayments(groups, 7);
	const upcomingPayouts = getUpcomingPayouts(groups);

	const activeGroups = groups.filter((g) => g.isActive);

	return {
		cashFlow,
		paidCashFlow,
		upcomingPayments,
		upcomingPayouts,
		activeGroups
	};
}
