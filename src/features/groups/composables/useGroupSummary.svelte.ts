import type { Group } from '$features/groups/types';
import { nextRoundOwe, totalIReceive, totalIOwe } from '$features/groups/utils/calculators';

/**
 * @param getGroup - Must be a reactive getter, not a plain value.
 * Usage: useGroupSummary(() => group) where `group` is $derived.
 * Callback pattern avoids Svelte 5 "state_referenced_locally" warning.
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
