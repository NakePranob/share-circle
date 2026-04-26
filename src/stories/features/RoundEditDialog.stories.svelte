<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RoundEditDialog from '$features/groups/components/RoundEditDialog.svelte';
	import { fn } from 'storybook/test';

	const { Story } = defineMeta({
		title: 'Features/RoundEditDialog',
		component: RoundEditDialog,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			editRound: null,
			editDate: '2026-01-15',
			editAmount: 5000,
			editPreviewOwe: 1000,
			editPreviewReceive: 5000,
			onClose: fn(),
			onSave: fn()
		}
	});
</script>

<Story name="Closed" />

<Story
	name="MyRoundOpen"
	args={{
		editRound: {
			roundNumber: 1,
			date: '2026-01-15',
			paymentAmount: 1000,
			receiveAmount: 5000,
			status: 'pending',
			isMyRound: true
		},
		open: true
	}}
/>

<Story
	name="PayRoundOpen"
	args={{
		editRound: {
			roundNumber: 2,
			date: '2026-02-15',
			paymentAmount: 1000,
			receiveAmount: 5000,
			status: 'pending',
			isMyRound: false
		},
		open: true
	}}
/>
