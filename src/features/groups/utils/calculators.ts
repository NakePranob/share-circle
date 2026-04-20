import { SvelteDate } from 'svelte/reactivity';
import type { Group, Round } from '$features/groups/types';
import type { GroupFormData } from '$features/groups/schemas/groupFormSchema';

export function buildRoundsFromFormData(data: GroupFormData): Round[] {
	const result: Round[] = [];
	for (let i = 0; i < data.totalRounds; i++) {
		const date = new SvelteDate(data.startDate);
		date.setDate(date.getDate() + i * data.frequency);
		result.push({
			date: date.toISOString().split('T')[0],
			paymentAmount: data.playMode === 'fixed' ? (data.fixedPaymentAmount ?? 0) : (data.steppedPayments?.[i] ?? 0),
			receiveAmount: data.receiveAmountPerRound,
			isMyRound: data.selectedRounds.includes(i),
			roundNumber: i + 1,
			status: 'pending'
		});
	}
	return result;
}

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
