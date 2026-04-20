import type { Group, Round } from '$features/shared/types';

/** Sum of payment amounts for all rounds we receive in this group */
export function myTotalOwe(group: Group): number {
	return group.rounds.filter((r) => r.isMyRound).reduce((s: number, r: Round) => s + r.paymentAmount, 0);
}

/** What we owe for a single round = sum of payment amounts of rounds we receive */
export function iOweForRound(group: Group): number {
	return group.rounds.filter((r) => r.isMyRound).reduce((s: number, r: Round) => s + r.paymentAmount, 0);
}

/** What we receive for a my-round = that round's receiveAmount */
export function iReceiveForRound(round: Round): number {
	return round.receiveAmount;
}

export function totalIReceive(group: Group): number {
	return group.rounds.filter((r) => r.isMyRound).reduce((s: number, r: Round) => s + r.receiveAmount, 0);
}

export function totalIOwe(group: Group): number {
	const payPerRound = myTotalOwe(group);
	const nonMyRounds = group.rounds.filter((r) => !r.isMyRound).length;
	return payPerRound * nonMyRounds;
}

export function paidCount(group: Group): number {
	return group.rounds.filter((r) => r.status === 'paid').length;
}

export function nextRound(group: Group): Round | undefined {
	return group.rounds.find((r) => r.status !== 'paid');
}
