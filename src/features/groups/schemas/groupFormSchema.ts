import { z } from 'zod';

export const groupFormSchema = z.object({
	groupName: z.string().min(1, 'กรุณากรอกชื่อวง').trim(),
	totalRounds: z.number().min(2, 'ต้องมีอย่างน้อย 2 มือ'),
	playMode: z.enum(['fixed', 'stepped']),
	frequency: z.number().min(1, 'ความถี่ต้องมากกว่า 0'),
	receiveAmountPerRound: z.number().positive('ยอดรับต้องมากกว่า 0'),
	startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'รูปแบบวันที่ไม่ถูกต้อง'),
	fixedPaymentAmount: z.number().positive('ยอดจ่ายต้องมากกว่า 0').optional(),
	steppedPayments: z.array(z.number().positive('ยอดจ่ายทุกมือต้องมากกว่า 0')).optional(),
	selectedRounds: z.array(z.number()).min(1, 'เลือกมือที่เราได้รับอย่างน้อย 1 มือ')
});

export type GroupFormData = z.infer<typeof groupFormSchema>;
