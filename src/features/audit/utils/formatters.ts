export function txnLabel(type: string) {
	if (type === 'payment') return 'จ่าย';
	if (type === 'payout') return 'รับ';
	if (type === 'deposit') return 'เติม';
	if (type === 'withdrawal') return 'เบิก';
	return type;
}

export function txnColor(type: string) {
	if (type === 'payment') return 'destructive';
	if (type === 'payout') return 'default';
	if (type === 'deposit') return 'default';
	if (type === 'withdrawal') return 'destructive';
	return 'outline';
}

export function formatDate(dateStr: string) {
	return new Intl.DateTimeFormat('th-TH', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	}).format(new Date(dateStr));
}
