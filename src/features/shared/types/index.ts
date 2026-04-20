export type RoundStatus = 'pending' | 'paid';
export type TransactionType = 'payment' | 'payout' | 'deposit' | 'withdrawal';

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

export interface Transaction {
	id: string;
	groupId: string | null;
	roundNumber: number | null;
	date: string;
	type: TransactionType;
	amount: number;
	isEstimate: boolean;
	note: string;
}

export interface Wallet {
	initialBalance: number;
	manualTransactions: Transaction[];
}

export interface DayData {
	date: string;
	balance: number;
	transactions: Array<{
		transaction: Transaction;
		groupName?: string;
	}>;
	hasNegativeBalance: boolean;
}
