<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import GroupCard from '$features/groups/components/GroupCard.svelte';
	import { fn } from 'storybook/test';
	import { activeGroup, inactiveGroup, allPaidGroup, payNextGroup } from './groupFixtures';

	const { Story } = defineMeta({
		title: 'Features/GroupCard',
		component: GroupCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: { onclick: fn() }
	});
</script>

<Story name="Active — MyRoundNext">
	<div class="w-80">
		<GroupCard group={activeGroup} onclick={fn()} />
	</div>
</Story>

<Story name="Active — PayNext">
	<div class="w-80">
		<GroupCard group={payNextGroup} onclick={fn()} />
	</div>
</Story>

<Story name="AllPaid">
	<div class="w-80">
		<GroupCard group={allPaidGroup} onclick={fn()} />
	</div>
</Story>

<Story name="Inactive">
	<div class="w-80">
		<GroupCard group={inactiveGroup} onclick={fn()} isActive={false} />
	</div>
</Story>
