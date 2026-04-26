import { z } from 'zod';

export const depositSchema = z.object({
	amount: z.number().positive('ยอดต้องมากกว่า 0'),
	note: z.string().optional()
});

export const withdrawSchema = z.object({
	amount: z.number().positive('ยอดต้องมากกว่า 0'),
	note: z.string().optional()
});

export const balanceSchema = z.object({
	amount: z.number().min(0, 'ยอดต้องไม่ติดลบ')
});

export type DepositInput = z.infer<typeof depositSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
export type BalanceInput = z.infer<typeof balanceSchema>;
