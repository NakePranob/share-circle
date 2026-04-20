import { buildCashFlow, buildPaidCashFlow, getUpcomingPayments, getUpcomingPayouts } from '$features/calendar/utils/cashflow';
import type { Group } from '$features/groups/types';
import type { Wallet } from '$features/wallet/types';

export function useDashboard(getGroups: () => Group[], getWallet: () => Wallet, year: number, month: number) {
	const groups = $derived(getGroups());
	const wallet = $derived(getWallet());

	const cashFlow = $derived(buildCashFlow(groups, wallet, year, month));
	const paidCashFlow = $derived(buildPaidCashFlow(groups, wallet, year, month));

	const upcomingPayments = $derived(getUpcomingPayments(groups, 3));
	const upcomingPayouts = $derived(getUpcomingPayouts(groups, 3));

	const activeGroups = $derived(groups.filter((g) => g.isActive));

	return {
		get cashFlow() { return cashFlow; },
		get paidCashFlow() { return paidCashFlow; },
		get upcomingPayments() { return upcomingPayments; },
		get upcomingPayouts() { return upcomingPayouts; },
		get activeGroups() { return activeGroups; }
	};
}
