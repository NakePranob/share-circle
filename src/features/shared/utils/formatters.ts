export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('th-TH', {
		style: 'currency',
		currency: 'THB',
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	}).format(amount);
}

export function formatDate(isoDate: string): string {
	const date = new Date(isoDate);
	return new Intl.DateTimeFormat('th-TH', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	}).format(date);
}

export function formatDateShort(isoDate: string): string {
	const date = new Date(isoDate);
	return new Intl.DateTimeFormat('th-TH', {
		day: 'numeric',
		month: 'short'
	}).format(date);
}
