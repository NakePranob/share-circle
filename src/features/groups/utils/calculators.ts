import { SvelteDate } from 'svelte/reactivity';
import type { Group, Round } from '$features/groups/types';
import type { GroupFormData } from '$features/groups/schemas/groupFormSchema';

export function buildRoundsFromFormData(data: GroupFormData): Round[] {
	const result: Round[] = [];

	const basePayments =
		data.playMode === 'fixed'
			? Array.from({ length: data.totalRounds }, () => data.fixedPaymentAmount ?? 0)
			: (data.steppedPayments ?? []);

	// ยอดจ่ายต่อมือ = ผลรวม paymentAmount ของมือที่เราเลือกรับ
	const myRoundsPaymentSum = data.selectedRounds.reduce((sum, i) => sum + (basePayments[i] ?? 0), 0);
	const paymentPerRound = data.selectedRounds.length > 0 ? myRoundsPaymentSum : 0;

	for (let i = 0; i < data.totalRounds; i++) {
		const date = new SvelteDate(data.startDate);
		date.setDate(date.getDate() + i * data.frequency);
		result.push({
			date: date.toISOString().split('T')[0],
			paymentAmount: paymentPerRound > 0 ? paymentPerRound : (basePayments[i] ?? 0),
			receiveAmount: data.receiveAmountPerRound,
			isMyRound: data.selectedRounds.includes(i),
			roundNumber: i + 1,
			status: 'pending'
		});
	}
	return result;
}

/** What we owe for a specific round = that round's paymentAmount (we pay every round) */
export function iOweForRound(group: Group, roundNumber: number): number {
	const round = group.rounds.find((r) => r.roundNumber === roundNumber);
	if (!round) return 0;
	return round.paymentAmount;
}

/** Payment amount for the next unpaid round (used for display/preview) */
export function nextRoundOwe(group: Group): number {
	const next = group.rounds.find((r) => r.status !== 'paid');
	return next?.paymentAmount ?? 0;
}

/** What we receive for a my-round = that round's receiveAmount */
export function iReceiveForRound(round: Round): number {
	return round.receiveAmount;
}

export function totalIReceive(group: Group): number {
	return group.rounds.filter((r) => r.isMyRound).reduce((s: number, r: Round) => s + r.receiveAmount, 0);
}

export function totalIOwe(group: Group): number {
	return group.rounds.reduce((s, r) => s + r.paymentAmount, 0);
}

export function paidCount(group: Group): number {
	return group.rounds.filter((r) => r.status === 'paid').length;
}

export function nextRound(group: Group): Round | undefined {
	return group.rounds.find((r) => r.status !== 'paid');
}
