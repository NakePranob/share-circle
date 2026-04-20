export type RoundStatus = 'pending' | 'paid';

export interface Round {
	roundNumber: number;
	date: string; // ISO date — set per round
	paymentAmount: number; // Amount to pay for this round (per round payment)
	receiveAmount: number; // Amount received in this round
	status: RoundStatus;
	isMyRound: boolean; // True if we receive this round
}

export interface Group {
	id: string;
	name: string;
	rounds: Round[];
	createdAt: string;
	isActive: boolean;
}
