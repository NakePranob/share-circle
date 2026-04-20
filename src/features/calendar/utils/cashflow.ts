import type { Group } from '$features/groups/types';
import type { Transaction, Wallet } from '$features/wallet/types';
import type { DayData } from '$features/calendar/types';
import { toISODate } from '$features/shared/utils/dateHelpers';
import { iOweForRound } from '$features/groups/utils/calculators';

function syntheticTransactions(groups: Group[]): Transaction[] {
	const txns: Transaction[] = [];

	for (const group of groups) {
		if (!group.isActive) continue;
		const owe = iOweForRound(group);

		for (const round of group.rounds) {
			// We pay every round
			txns.push({
				id: `${group.id}-${round.roundNumber}-payment`,
				groupId: group.id,
				roundNumber: round.roundNumber,
				date: round.date,
				type: 'payment',
				amount: owe,
				isEstimate: false,
				note: `${group.name} มือ ${round.roundNumber}`
			});

			// If it's our round, we also receive money
			if (round.isMyRound) {
				txns.push({
					id: `${group.id}-${round.roundNumber}-payout`,
					groupId: group.id,
					roundNumber: round.roundNumber,
					date: round.date,
					type: 'payout',
					amount: round.receiveAmount,
					isEstimate: false,
					note: `${group.name} มือ ${round.roundNumber} — รับเงิน`
				});
			}
		}
	}

	return txns;
}

function paidTransactions(groups: Group[]): Transaction[] {
	const txns: Transaction[] = [];

	for (const group of groups) {
		if (!group.isActive) continue;
		const owe = iOweForRound(group);

		for (const round of group.rounds) {
			if (round.status === 'paid') {
				txns.push({
					id: `${group.id}-${round.roundNumber}-payment-paid`,
					groupId: group.id,
					roundNumber: round.roundNumber,
					date: round.date,
					type: 'payment',
					amount: owe,
					isEstimate: false,
					note: `${group.name} มือ ${round.roundNumber}`
				});
			}

			if (round.isMyRound && round.payoutStatus === 'received') {
				txns.push({
					id: `${group.id}-${round.roundNumber}-payout-paid`,
					groupId: group.id,
					roundNumber: round.roundNumber,
					date: round.date,
					type: 'payout',
					amount: round.receiveAmount,
					isEstimate: false,
					note: `${group.name} มือ ${round.roundNumber} — รับเงิน`
				});
			}
		}
	}

	return txns;
}

export { paidTransactions };

export function buildPaidCashFlow(
	groups: Group[],
	wallet: Wallet,
	year: number,
	month: number
): Map<string, DayData> {
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const dayMap = new Map<string, DayData>();

	for (let d = 1; d <= daysInMonth; d++) {
		const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
		dayMap.set(dateStr, { date: dateStr, balance: 0, transactions: [], hasNegativeBalance: false });
	}

	const groupMap = new Map(groups.map((g) => [g.id, g.name]));
	const allEntries: Array<{ transaction: Transaction; groupName?: string }> = [
		...wallet.manualTransactions.map((t) => ({ transaction: t })),
		...paidTransactions(groups).map((t) => ({
			transaction: t,
			groupName: t.groupId ? groupMap.get(t.groupId) : undefined
		}))
	].sort((a, b) => a.transaction.date.localeCompare(b.transaction.date));

	const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

	// Carry-over: sum all transactions before this month
	let balance = wallet.initialBalance;
	for (const entry of allEntries) {
		if (entry.transaction.date >= monthPrefix) break;
		const { type, amount } = entry.transaction;
		balance += type === 'payment' || type === 'withdrawal' ? -amount : amount;
	}

	for (let d = 1; d <= daysInMonth; d++) {
		const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
		const day = dayMap.get(dateStr)!;

		for (const entry of allEntries) {
			if (entry.transaction.date !== dateStr) continue;
			day.transactions.push(entry);
			const { type, amount } = entry.transaction;
			balance += type === 'payment' || type === 'withdrawal' ? -amount : amount;
		}

		day.balance = balance;
		day.hasNegativeBalance = balance < 0;
	}

	return dayMap;
}

export function buildCashFlow(
	groups: Group[],
	wallet: Wallet,
	year: number,
	month: number
): Map<string, DayData> {
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const dayMap = new Map<string, DayData>();

	for (let d = 1; d <= daysInMonth; d++) {
		const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
		dayMap.set(dateStr, { date: dateStr, balance: 0, transactions: [], hasNegativeBalance: false });
	}

	const groupMap = new Map(groups.map((g) => [g.id, g.name]));
	const allEntries: Array<{ transaction: Transaction; groupName?: string }> = [
		...wallet.manualTransactions.map((t) => ({ transaction: t })),
		...syntheticTransactions(groups).map((t) => ({
			transaction: t,
			groupName: t.groupId ? groupMap.get(t.groupId) : undefined
		}))
	].sort((a, b) => a.transaction.date.localeCompare(b.transaction.date));

	const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

	// Carry-over: sum all transactions before this month
	let balance = wallet.initialBalance;
	for (const entry of allEntries) {
		if (entry.transaction.date >= monthPrefix) break;
		const { type, amount } = entry.transaction;
		balance += type === 'payment' || type === 'withdrawal' ? -amount : amount;
	}

	for (let d = 1; d <= daysInMonth; d++) {
		const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
		const day = dayMap.get(dateStr)!;

		for (const entry of allEntries) {
			if (entry.transaction.date !== dateStr) continue;
			day.transactions.push(entry);
			const { type, amount } = entry.transaction;
			balance += type === 'payment' || type === 'withdrawal' ? -amount : amount;
		}

		day.balance = balance;
		day.hasNegativeBalance = balance < 0;
	}

	return dayMap;
}

export function getUpcomingPayments(
	groups: Group[],
	daysAhead = 7
): Array<{ group: Group; round: Group['rounds'][0]; daysUntil: number; owe: number }> {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const future = new Date(today);
	future.setDate(today.getDate() + daysAhead);

	const results: Array<{
		group: Group;
		round: Group['rounds'][0];
		daysUntil: number;
		owe: number;
	}> = [];

	for (const group of groups) {
		if (!group.isActive) continue;
		const owe = iOweForRound(group);

		for (const round of group.rounds) {
			if (round.status === 'paid') continue;
			const roundDate = new Date(round.date);
			roundDate.setHours(0, 0, 0, 0);
			if (roundDate <= future) {
				const daysUntil = Math.ceil(
					(roundDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
				);
				results.push({ group, round, daysUntil, owe });
			}
		}
	}

	return results.sort((a, b) => a.round.date.localeCompare(b.round.date));
}

export function getUpcomingPayouts(
	groups: Group[]
): Array<{ group: Group; round: Group['rounds'][0] }> {
	const today = toISODate(new Date());
	const results: Array<{ group: Group; round: Group['rounds'][0] }> = [];

	for (const group of groups) {
		if (!group.isActive) continue;
		for (const round of group.rounds) {
			if (round.isMyRound && round.payoutStatus !== 'received' && round.date >= today) {
				results.push({ group, round });
			}
		}
	}

	return results.sort((a, b) => a.round.date.localeCompare(b.round.date));
}
