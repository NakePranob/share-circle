import type { Group } from '$features/groups/types';
import { nextRoundOwe, totalIReceive, totalIOwe } from '$features/groups/utils/calculators';

/**
 * @param getGroup - Must be a reactive getter, not a plain value.
 * Usage: useGroupSummary(() => group) where `group` is $derived.
 * Returns getters to maintain reactivity in Svelte 5.
 */
export function useGroupSummary(getGroup: () => Group | undefined) {
	return {
		get owe() {
			const group = getGroup();
			return group ? nextRoundOwe(group) : 0;
		},
		get sumReceive() {
			const group = getGroup();
			return group ? totalIReceive(group) : 0;
		},
		get sumOwe() {
			const group = getGroup();
			return group ? totalIOwe(group) : 0;
		},
		get profit() {
			const group = getGroup();
			const receive = group ? totalIReceive(group) : 0;
			const owe = group ? totalIOwe(group) : 0;
			return receive - owe;
		},
		get isProfitable() {
			const group = getGroup();
			const receive = group ? totalIReceive(group) : 0;
			const owe = group ? totalIOwe(group) : 0;
			return receive - owe >= 0;
		}
	};
}
