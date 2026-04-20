// Calendar display constants
export const CALENDAR_CONFIG = {
	DEFAULT_VIEW_YEAR: new Date().getFullYear(),
	DEFAULT_VIEW_MONTH: new Date().getMonth(),
	DAYS_IN_WEEK: 7
} as const;

// Toast messages (if needed in the future)
export const TOAST_MESSAGES = {
	MARK_AS_PAID: 'จ่ายเงินเรียบร้อย',
	MARK_AS_RECEIVED: 'รับเงินเรียบร้อย'
} as const;
