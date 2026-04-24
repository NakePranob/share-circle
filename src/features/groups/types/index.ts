export const ROUND_STATUS = {
	PENDING: 'pending',
	PAID: 'paid'
} as const;
export type RoundStatus = typeof ROUND_STATUS[keyof typeof ROUND_STATUS];

export const PAYOUT_STATUS = {
	PENDING: 'pending',
	RECEIVED: 'received'
} as const;
export type PayoutStatus = typeof PAYOUT_STATUS[keyof typeof PAYOUT_STATUS];

export interface Round {
	roundNumber: number;
	date: string; // ISO date — set per round
	paymentAmount: number; // Amount to pay for this round (per round payment)
	receiveAmount: number; // Amount received in this round
	status: RoundStatus; // payment status
	paidAt?: string; // ISO date when actually paid (may differ from round date)
	payoutStatus?: PayoutStatus; // only relevant when isMyRound = true
	receivedAt?: string; // ISO date when actually received
	isMyRound: boolean; // True if we receive this round
	managementFee?: number; // Fee deducted when receiving (only relevant for isMyRound)
}

export interface Group {
	id: string;
	name: string;
	rounds: Round[];
	createdAt: string;
	isActive: boolean;
	managementFeePerRound?: number;
}
