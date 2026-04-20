export interface DayData {
	date: string;
	balance: number;
	transactions: Array<{
		transaction: import('$features/wallet/types').Transaction;
		groupName?: string;
	}>;
	hasNegativeBalance: boolean;
}
