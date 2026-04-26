import type { Group, Round } from '$features/groups/types';
import { nextRoundOwe } from '$features/groups/utils/calculators';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { getUpcomingPayments, getUpcomingPayouts } from '$features/calendar/utils/cashflow';
import { useGroupsStore } from '$features/groups/stores/groups.svelte';

interface UpcomingPayment {
	group: Group;
	round: Round;
	daysUntil: number;
	owe: number;
}

interface UpcomingPayout {
	group: Group;
	round: Round;
	daysUntil: number;
}

export interface FlatRound {
	group: Group;
	owe: number;
	roundNumber: number;
	payment: UpcomingPayment | null;
	payout: UpcomingPayout | null;
	date: string;
}

/**
 * Composable สำหรับจัดการรายการที่ใกล้ถึง (upcoming rounds)
 * อ่านค่าจาก stores โดยตรงเพื่อให้ reactive เมื่อข้อมูลเปลี่ยน
 * @returns รายการที่ใกล้ถึงที่จัดเรียงตามวันที่
 */
export function useUpcomingRounds() {
	const groupsStore = useGroupsStore();

	const flatRounds = $derived.by(() => {
		const groups = groupsStore.groups;
		const upcomingPayments = getUpcomingPayments(groups, 3);
		const upcomingPayouts = getUpcomingPayouts(groups, 3);
		return buildFlatRounds(groups, upcomingPayments, upcomingPayouts);
	});

	function buildFlatRounds(
		groups: Group[],
		upcomingPayments: UpcomingPayment[],
		upcomingPayouts: UpcomingPayout[]
	): FlatRound[] {
		return groups
			.flatMap((group) => {
				const owe = nextRoundOwe(group);
				const paymentMap = new SvelteMap(
					upcomingPayments
						.filter((p) => p.group.id === group.id)
						.map((p) => [p.round.roundNumber, p])
				);
				const payoutMap = new SvelteMap(
					upcomingPayouts
						.filter((p) => p.group.id === group.id)
						.map((p) => [p.round.roundNumber, p])
				);
				const roundNumbers = [...new SvelteSet([...paymentMap.keys(), ...payoutMap.keys()])];
				return roundNumbers.map((n) => ({
					group,
					owe,
					roundNumber: n,
					payment: paymentMap.get(n) ?? null,
					payout: payoutMap.get(n) ?? null,
					date: paymentMap.get(n)?.round.date ?? payoutMap.get(n)?.round.date ?? ''
				}));
			})
			.sort((a, b) => a.date.localeCompare(b.date));
	}

	return {
		get flatRounds() {
			return flatRounds;
		}
	};
}
