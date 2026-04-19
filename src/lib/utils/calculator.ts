import type { Group, Round } from '$lib/types';

/** Sum of amounts for all rounds we receive in this group */
export function myTotalOwe(group: Group): number {
	return group.rounds.filter((r) => r.isMyRound).reduce((s, r) => s + r.amount, 0);
}

/** What we owe for a single non-my round = sum of all our received amounts */
export function iOweForRound(group: Group): number {
	return myTotalOwe(group);
}

/** What we receive for a my-round = that round's amount */
export function iReceiveForRound(round: Round): number {
	return round.amount;
}

export function totalIReceive(group: Group): number {
	return group.rounds.filter((r) => r.isMyRound).reduce((s, r) => s + r.amount, 0);
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
