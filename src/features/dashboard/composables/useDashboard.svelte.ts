import {
	buildCashFlow,
	buildPaidCashFlow,
	getUpcomingPayments,
	getUpcomingPayouts
} from '$features/calendar/utils/cashflow';
import { useGroupsStore } from '$features/groups/stores/groups.svelte';
import { useWalletStore } from '$features/wallet/stores/wallet.svelte';

/**
 * Composable สำหรับจัดการ dashboard logic
 * รับ stores โดยตรง ไม่ใช้ callback เพื่อลด boilerplate
 * @param year - ปีที่ต้องการดูข้อมูล
 * @param month - เดือนที่ต้องการดูข้อมูล (0-11)
 * @returns Dashboard data และ computed values
 */
export function useDashboard(year: number, month: number) {
	const groupsStore = useGroupsStore();
	const walletStore = useWalletStore();

	const groups = $derived(groupsStore.groups);
	const wallet = $derived(walletStore.wallet);

	const cashFlow = $derived(buildCashFlow(groups, wallet, year, month));
	const paidCashFlow = $derived(buildPaidCashFlow(groups, wallet, year, month));

	const upcomingPayments = $derived(getUpcomingPayments(groups, 3));
	const upcomingPayouts = $derived(getUpcomingPayouts(groups, 3));

	const activeGroups = $derived(groups.filter((g: { isActive: boolean }) => g.isActive));

	return {
		get cashFlow() {
			return cashFlow;
		},
		get paidCashFlow() {
			return paidCashFlow;
		},
		get upcomingPayments() {
			return upcomingPayments;
		},
		get upcomingPayouts() {
			return upcomingPayouts;
		},
		get activeGroups() {
			return activeGroups;
		}
	};
}
