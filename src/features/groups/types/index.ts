export type RoundStatus = 'pending' | 'paid';
export type PayoutStatus = 'pending' | 'received';

export interface Round {
	roundNumber: number;
	date: string; // ISO date — set per round
	paymentAmount: number; // Amount to pay for this round (per round payment)
	receiveAmount: number; // Amount received in this round
	status: RoundStatus; // payment status
	payoutStatus?: PayoutStatus; // only relevant when isMyRound = true
	isMyRound: boolean; // True if we receive this round
}

export interface Group {
	id: string;
	name: string;
	rounds: Round[];
	createdAt: string;
	isActive: boolean;
}
