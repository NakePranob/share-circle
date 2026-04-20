// Default values for group form
export const DEFAULT_TOTAL_ROUNDS = 10;
export const DEFAULT_FREQUENCY = 30; // days
export const DEFAULT_RECEIVE_AMOUNT_PER_ROUND = 50000;
export const DEFAULT_FIXED_PAYMENT_AMOUNT = 1000;

// Toast messages
export const TOAST_MESSAGES = {
	PAID: 'จ่ายเงินเรียบร้อย',
	STATUS_CHANGED: 'เปลี่ยนสถานะเรียบร้อย',
	GROUP_DELETED: 'ลบวงแชร์เรียบร้อย',
	SAVED: 'บันทึกเรียบร้อย'
} as const;

// Validation messages
export const VALIDATION_MESSAGES = {
	REQUIRED: 'กรุณากรอกข้อมูล',
	POSITIVE_NUMBER: 'ต้องมากกว่า 0',
	MIN_ROUNDS: 'ต้องมีอย่างน้อย 2 มือ',
	SELECT_MY_ROUND: 'เลือกมือที่เราได้รับอย่างน้อย 1 มือ',
	INVALID_DATE_FORMAT: 'รูปแบบวันที่ไม่ถูกต้อง',
	STEPPED_PAYMENTS_ALL_POSITIVE: 'ยอดจ่ายทุกมือต้องมากกว่า 0'
} as const;
