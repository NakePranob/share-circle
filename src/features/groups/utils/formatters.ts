import type { Group, Round } from '$features/groups/types';

/**
 * คำนวณกำไร/ขาดทุนของมือ
 */
export function calculateRoundProfit(round: Round): number {
	return round.receiveAmount - round.paymentAmount;
}

/**
 * ดึงหมายเลขมือที่เป็นของเราทั้งหมด
 */
export function getMyRoundNumbers(group: Group): string {
	return group.rounds.filter((r) => r.isMyRound).map((r) => r.roundNumber).join(', ') || '—';
}
