export type TransactionType = 'payment' | 'payout' | 'deposit' | 'withdrawal';

export interface Transaction {
	id: string;
	groupId: string | null;
	roundNumber: number | null;
	date: string;
	actionAt?: string; // full ISO timestamp of when action was taken (for sort)
	type: TransactionType;
	amount: number;
	isEstimate: boolean;
	note: string;
}

export interface Wallet {
	initialBalance: number;
	manualTransactions: Transaction[];
}
