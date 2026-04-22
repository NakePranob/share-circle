import type { Group, Round } from '$features/groups/types';
import { nextRoundOwe } from '$features/groups/utils/calculators';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

interface UpcomingPayment {
	group: Group;
	round: Round;
	daysUntil: number;
	owe: number;
}

interface UpcomingPayout {
	group: Group;
	round: Round;
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
 * ย้าย logic จาก component มาเพื่อให้ทดสอบและ reuse ได้ง่ายขึ้น
 * @param groups - รายการวงทั้งหมด
 * @param upcomingPayments - รายการที่ต้องจ่ายที่ใกล้ถึง
 * @param upcomingPayouts - รายการที่จะได้รับที่ใกล้ถึง
 * @returns รายการที่ใกล้ถึงที่จัดเรียงตามวันที่
 */
export function useUpcomingRounds(
	groups: Group[],
	upcomingPayments: UpcomingPayment[],
	upcomingPayouts: UpcomingPayout[]
) {
	const flatRounds = $derived(buildFlatRounds(groups, upcomingPayments, upcomingPayouts));

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
					date: paymentMap.get(n)?.round.date ?? payoutMap.get(n)!.round.date
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
