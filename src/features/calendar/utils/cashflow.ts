import { ROUND_STATUS, PAYOUT_STATUS } from '$features/groups/types';
import type { Group } from '$features/groups/types';
import { TRANSACTION_TYPE } from '$features/wallet/types';
import type { Transaction, Wallet } from '$features/wallet/types';
import type { DayData } from '$features/calendar/types';
import { formatCurrency } from '$features/shared/utils';
function syntheticTransactions(groups: Group[]): Transaction[] {
	const txns: Transaction[] = [];

	for (const group of groups) {
		if (!group.isActive) continue;

		for (const round of group.rounds) {
			// We pay every round
			txns.push({
				id: `${group.id}-${round.roundNumber}-payment`,
				groupId: group.id,
				roundNumber: round.roundNumber,
				date: round.date,
				type: TRANSACTION_TYPE.PAYMENT,
				amount: round.paymentAmount,
				isEstimate: false,
				note: `${group.name} มือ ${round.roundNumber}`
			});

			// If it's our round, we also receive money (net of management fee)
			if (round.isMyRound) {
				const fee = round.managementFee ?? 0;
				txns.push({
					id: `${group.id}-${round.roundNumber}-payout`,
					groupId: group.id,
					roundNumber: round.roundNumber,
					date: round.date,
					type: TRANSACTION_TYPE.PAYOUT,
					amount: round.receiveAmount - fee,
					isEstimate: false,
					note: `${group.name} มือ ${round.roundNumber} • รับเงิน${fee > 0 ? ` (หักค่าดูแล ${formatCurrency(fee)})` : ''}`
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

		for (const round of group.rounds) {
			if (round.status === ROUND_STATUS.PAID) {
				const paidAt = round.paidAt ?? round.date;
				txns.push({
					id: `${group.id}-${round.roundNumber}-payment-paid`,
					groupId: group.id,
					roundNumber: round.roundNumber,
					date: paidAt.slice(0, 10),
					actionAt: paidAt,
					type: TRANSACTION_TYPE.PAYMENT,
					amount: round.paymentAmount,
					isEstimate: false,
					note: `${group.name} มือ ${round.roundNumber}`
				});
			}

			if (round.isMyRound && round.payoutStatus === PAYOUT_STATUS.RECEIVED) {
				const receivedAt = round.receivedAt ?? round.date;
				const fee = round.managementFee ?? 0;
				txns.push({
					id: `${group.id}-${round.roundNumber}-payout-paid`,
					groupId: group.id,
					roundNumber: round.roundNumber,
					date: receivedAt.slice(0, 10),
					actionAt: receivedAt,
					type: TRANSACTION_TYPE.PAYOUT,
					amount: round.receiveAmount - fee,
					isEstimate: false,
					note: `${group.name} มือ ${round.roundNumber} • รับเงิน${fee > 0 ? ` (หักค่าดูแล ${formatCurrency(fee)})` : ''}`
				});
			}
		}
	}

	return txns;
}

function pendingTransactions(groups: Group[]): Transaction[] {
	const txns: Transaction[] = [];

	for (const group of groups) {
		if (!group.isActive) continue;

		for (const round of group.rounds) {
			if (round.status !== ROUND_STATUS.PAID) {
				txns.push({
					id: `${group.id}-${round.roundNumber}-payment`,
					groupId: group.id,
					roundNumber: round.roundNumber,
					date: round.date,
					type: TRANSACTION_TYPE.PAYMENT,
					amount: round.paymentAmount,
					isEstimate: true,
					note: `${group.name} มือ ${round.roundNumber}`
				});
			}

			if (round.isMyRound && round.payoutStatus !== PAYOUT_STATUS.RECEIVED) {
				const fee = round.managementFee ?? 0;
				txns.push({
					id: `${group.id}-${round.roundNumber}-payout`,
					groupId: group.id,
					roundNumber: round.roundNumber,
					date: round.date,
					type: TRANSACTION_TYPE.PAYOUT,
					amount: round.receiveAmount - fee,
					isEstimate: true,
					note: `${group.name} มือ ${round.roundNumber} • รับเงิน${fee > 0 ? ` (หักค่าดูแล ${formatCurrency(fee)})` : ''}`
				});
			}
		}
	}

	return txns;
}

export { paidTransactions };

// Under Option A, wallet.initialBalance is always the current live balance.
// buildDayMap only projects future (pending) transactions forward from initialBalance.
// Manual transactions and paid group rounds are already baked into initialBalance — do not re-include them.
function buildDayMap(
	txns: Transaction[],
	wallet: Wallet,
	year: number,
	month: number,
	groupMap: Map<string, string>
): Map<string, DayData> {
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const dayMap = new Map<string, DayData>();
	const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

	for (let d = 1; d <= daysInMonth; d++) {
		const dateStr = `${monthPrefix}-${String(d).padStart(2, '0')}`;
		dayMap.set(dateStr, { date: dateStr, balance: 0, transactions: [], hasNegativeBalance: false });
	}

	const allEntries: Array<{ transaction: Transaction; groupName?: string }> = txns
		.map((t) => ({ transaction: t, groupName: t.groupId ? groupMap.get(t.groupId) : undefined }))
		.sort((a, b) => a.transaction.date.localeCompare(b.transaction.date));

	// Start from current live balance — no need to accumulate past transactions
	let balance = wallet.initialBalance;
	// const todayStr = new Date().toISOString().slice(0, 10);

	for (let d = 1; d <= daysInMonth; d++) {
		const dateStr = `${monthPrefix}-${String(d).padStart(2, '0')}`;
		const day = dayMap.get(dateStr)!;

		for (const entry of allEntries) {
			if (entry.transaction.date !== dateStr) continue;
			day.transactions.push(entry);
			// only accumulate balance from today onwards — past is baked into initialBalance
			// if (dateStr >= todayStr ) {
			const { type, amount } = entry.transaction;
			balance +=
				type === TRANSACTION_TYPE.PAYMENT || type === TRANSACTION_TYPE.WITHDRAWAL
					? -amount
					: amount;
			// }
		}

		day.balance = balance;
		day.hasNegativeBalance = balance < 0;
	}

	return dayMap;
}

// Projected = pending rounds only, applied forward from current initialBalance
export function buildProjectedCashFlow(
	groups: Group[],
	wallet: Wallet,
	year: number,
	month: number
): Map<string, DayData> {
	const groupMap = new Map(groups.map((g) => [g.id, g.name]));
	return buildDayMap(pendingTransactions(groups), wallet, year, month, groupMap);
}

// paidCashFlow kept for backwards compatibility with DaySheet — returns same as projected
export function buildPaidCashFlow(
	groups: Group[],
	wallet: Wallet,
	year: number,
	month: number
): Map<string, DayData> {
	return buildProjectedCashFlow(groups, wallet, year, month);
}

export function buildCashFlow(
	groups: Group[],
	wallet: Wallet,
	year: number,
	month: number
): Map<string, DayData> {
	const groupMap = new Map(groups.map((g) => [g.id, g.name]));
	return buildDayMap(syntheticTransactions(groups), wallet, year, month, groupMap);
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

		for (const round of group.rounds) {
			if (round.status === ROUND_STATUS.PAID) continue;
			const roundDate = new Date(round.date);
			roundDate.setHours(0, 0, 0, 0);
			if (roundDate <= future) {
				const daysUntil = Math.ceil(
					(roundDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
				);
				results.push({ group, round, daysUntil, owe: round.paymentAmount });
			}
		}
	}

	return results.sort((a, b) => a.round.date.localeCompare(b.round.date));
}

export function getUpcomingPayouts(
	groups: Group[],
	daysAhead = 7
): Array<{ group: Group; round: Group['rounds'][0]; daysUntil: number }> {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const future = new Date(today);
	future.setDate(today.getDate() + daysAhead);

	const results: Array<{ group: Group; round: Group['rounds'][0]; daysUntil: number }> = [];

	for (const group of groups) {
		if (!group.isActive) continue;
		for (const round of group.rounds) {
			if (round.isMyRound && round.payoutStatus !== PAYOUT_STATUS.RECEIVED) {
				const roundDate = new Date(round.date);
				roundDate.setHours(0, 0, 0, 0);
				if (roundDate <= future) {
					const daysUntil = Math.ceil(
						(roundDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
					);
					results.push({ group, round, daysUntil });
				}
			}
		}
	}

	return results.sort((a, b) => a.round.date.localeCompare(b.round.date));
}
