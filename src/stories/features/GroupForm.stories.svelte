<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import GroupForm from '$features/groups/components/GroupForm.svelte';
	import { fn } from 'storybook/test';

	const { Story } = defineMeta({
		title: 'Features/GroupForm',
		component: GroupForm,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			onSubmit: fn()
		}
	});
</script>

<Story name="Default" />
