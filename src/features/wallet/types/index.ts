export const TRANSACTION_TYPE = {
	PAYMENT: 'payment',
	PAYOUT: 'payout',
	DEPOSIT: 'deposit',
	WITHDRAWAL: 'withdrawal'
} as const;
export type TransactionType = typeof TRANSACTION_TYPE[keyof typeof TRANSACTION_TYPE];

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
	transactions: Transaction[];
}
