import type { Group } from '$features/groups/types';
import { paidCount, nextRound } from '$features/groups/utils/calculators';

/**
 * Composable สำหรับจัดการ statistics ของวง
 * ย้าย logic ที่ใช้ซ้ำจาก components มาที่นี่
 */
export function useGroupStats() {
	/**
	 * คำนวณเปอร์เซ็นต์ความคืบหน้าของวง
	 * @param group - วงที่ต้องการคำนวณ
	 * @returns เปอร์เซ็นต์ความคืบหน้า (0-100)
	 */
	function progress(group: Group): number {
		const paid = paidCount(group);
		return (paid / group.rounds.length) * 100;
	}

	return {
		paidCount,
		nextRound,
		progress
	};
}
