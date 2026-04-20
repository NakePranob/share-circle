<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RoundList from '$features/groups/components/RoundList.svelte';
	import { fn } from 'storybook/test';
	import { activeGroup } from './groupFixtures';

	const { Story } = defineMeta({
		title: 'Features/RoundList',
		component: RoundList,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			group: activeGroup,
			owe: 1000,
			onEditRound: fn(),
			onMarkPaid: fn(),
			onMarkPending: fn()
		}
	});
</script>

<Story name="Default" />
