import type { Group } from '$features/groups/types';
import type { Transaction } from '$features/wallet/types';

export const activeGroup: Group = {
	id: '1',
	name: 'วงแชร์บ้าน 2569',
	createdAt: '2026-01-01',
	isActive: true,
	rounds: [
		{ roundNumber: 1, date: '2026-01-01', paymentAmount: 1000, receiveAmount: 10000, status: 'paid', isMyRound: false },
		{ roundNumber: 2, date: '2026-02-01', paymentAmount: 1000, receiveAmount: 10000, status: 'paid', isMyRound: false },
		{ roundNumber: 3, date: '2026-03-01', paymentAmount: 1000, receiveAmount: 10000, status: 'pending', isMyRound: true },
		{ roundNumber: 4, date: '2026-04-01', paymentAmount: 1000, receiveAmount: 10000, status: 'pending', isMyRound: false },
		{ roundNumber: 5, date: '2026-05-01', paymentAmount: 1000, receiveAmount: 10000, status: 'pending', isMyRound: false }
	]
};

export const inactiveGroup: Group = {
	id: '2',
	name: 'วงแชร์เก่า 2568',
	createdAt: '2025-01-01',
	isActive: false,
	rounds: [
		{ roundNumber: 1, date: '2025-01-01', paymentAmount: 1000, receiveAmount: 10000, status: 'paid', isMyRound: false },
		{ roundNumber: 2, date: '2025-02-01', paymentAmount: 1000, receiveAmount: 10000, status: 'paid', isMyRound: true },
		{ roundNumber: 3, date: '2025-03-01', paymentAmount: 1000, receiveAmount: 10000, status: 'paid', isMyRound: false }
	]
};

export const allPaidGroup: Group = {
	id: '3',
	name: 'วงแชร์ออฟฟิศ (เสร็จแล้ว)',
	createdAt: '2026-01-01',
	isActive: true,
	rounds: [
		{ roundNumber: 1, date: '2026-01-01', paymentAmount: 1000, receiveAmount: 10000, status: 'paid', isMyRound: true },
		{ roundNumber: 2, date: '2026-02-01', paymentAmount: 1000, receiveAmount: 10000, status: 'paid', isMyRound: false },
		{ roundNumber: 3, date: '2026-03-01', paymentAmount: 1000, receiveAmount: 10000, status: 'paid', isMyRound: false }
	]
};

export const payNextGroup: Group = {
	id: '4',
	name: 'วงแชร์เพื่อน',
	createdAt: '2026-01-01',
	isActive: true,
	rounds: [
		{ roundNumber: 1, date: '2026-01-01', paymentAmount: 500, receiveAmount: 5000, status: 'paid', isMyRound: false },
		{ roundNumber: 2, date: '2026-02-01', paymentAmount: 500, receiveAmount: 5000, status: 'pending', isMyRound: false },
		{ roundNumber: 3, date: '2026-03-01', paymentAmount: 500, receiveAmount: 5000, status: 'pending', isMyRound: true }
	]
};

export const transactions: Array<{ transaction: Transaction; groupName?: string }> = [
	{
		transaction: { id: '1', groupId: null, roundNumber: null, date: '2026-04-01', type: 'deposit', amount: 5000, isEstimate: false, note: 'ฝากเงินเริ่มต้น' }
	},
	{
		transaction: { id: '2', groupId: 'g1', roundNumber: 3, date: '2026-04-05', type: 'payout', amount: 10000, isEstimate: false, note: '' },
		groupName: 'วงแชร์บ้าน 2569'
	},
	{
		transaction: { id: '3', groupId: 'g1', roundNumber: 1, date: '2026-03-01', type: 'payment', amount: 1000, isEstimate: false, note: '' },
		groupName: 'วงแชร์บ้าน 2569'
	},
	{
		transaction: { id: '4', groupId: null, roundNumber: null, date: '2026-03-15', type: 'withdrawal', amount: 2000, isEstimate: false, note: 'ถอนใช้ส่วนตัว' }
	},
	{
		transaction: { id: '5', groupId: 'g2', roundNumber: 2, date: '2026-04-10', type: 'payment', amount: 500, isEstimate: true, note: '' },
		groupName: 'วงแชร์เพื่อน'
	}
];
