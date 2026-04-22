import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';

export function toISODate(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return format(d, 'yyyy-MM-dd');
}

export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('th-TH', {
		style: 'currency',
		currency: 'THB',
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	}).format(amount);
}

export function formatDate(isoDate: string): string {
	const date = parseISO(isoDate);
	return format(date, 'd MMM yyyy', { locale: th });
}

export function formatDateShort(isoDate: string): string {
	const date = parseISO(isoDate);
	return format(date, 'd MMM', { locale: th });
}

export function formatMonthYear(year: number, month: number): string {
	const date = new Date(year, month, 1);
	return format(date, 'MMMM yyyy', { locale: th });
}

export function thaiDateToday(): string {
	return new Intl.DateTimeFormat('th-TH', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(new Date());
}
