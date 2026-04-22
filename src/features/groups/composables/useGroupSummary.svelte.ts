import type { Group } from '$features/groups/types';
import { nextRoundOwe, totalIReceive, totalIOwe } from '$features/groups/utils/calculators';

/**
 * Composable สำหรับจัดการ summary ของวง (ยอดรวม, กำไร/ขาดทุน)
 * ย้าย logic คำนวณจาก component มาที่นี่
 * @param getGroup - Callback function ที่ return Group หรือ undefined เพื่อหลีกเลี่ยง state_referenced_locally
 */
export function useGroupSummary(getGroup: () => Group | undefined) {
	const group = $derived(getGroup());
	const owe = $derived(group ? nextRoundOwe(group) : 0);
	const sumReceive = $derived(group ? totalIReceive(group) : 0);
	const sumOwe = $derived(group ? totalIOwe(group) : 0);
	const profit = $derived(sumReceive - sumOwe);
	const isProfitable = $derived(profit >= 0);

	return {
		owe,
		sumReceive,
		sumOwe,
		profit,
		isProfitable
	};
}
