import type { Group, Round } from '$lib/types';

/** Sum of payment amounts for all rounds we receive in this group */
export function myTotalOwe(group: Group): number {
	return group.rounds.filter((r) => r.isMyRound).reduce((s, r) => s + r.paymentAmount, 0);
}

/** What we owe for a single round = sum of payment amounts of rounds we receive */
export function iOweForRound(group: Group): number {
	return group.rounds.filter((r) => r.isMyRound).reduce((s, r) => s + r.paymentAmount, 0);
}

/** What we receive for a my-round = that round's receiveAmount */
export function iReceiveForRound(round: Round): number {
	return round.receiveAmount;
}

export function totalIReceive(group: Group): number {
	return group.rounds.filter((r) => r.isMyRound).reduce((s, r) => s + r.receiveAmount, 0);
}

export function totalIOwe(group: Group): number {
	const payPerRound = myTotalOwe(group);
	const nonMyRounds = group.rounds.filter((r) => !r.isMyRound).length;
	return payPerRound * nonMyRounds;
}

export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('th-TH', {
		style: 'currency',
		currency: 'THB',
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	}).format(amount);
}

export function formatDate(isoDate: string): string {
	const date = new Date(isoDate);
	return new Intl.DateTimeFormat('th-TH', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	}).format(date);
}

export function formatDateShort(isoDate: string): string {
	const date = new Date(isoDate);
	return new Intl.DateTimeFormat('th-TH', {
		day: 'numeric',
		month: 'short'
	}).format(date);
}
