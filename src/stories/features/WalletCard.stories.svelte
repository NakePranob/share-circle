<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import WalletCard from '$features/calendar/components/WalletCard.svelte';
	import { fn } from 'storybook/test';

	const { Story } = defineMeta({
		title: 'Features/WalletCard',
		component: WalletCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			balance: {
				control: { type: 'number' }
			}
		},
		args: {
			onSetBalance: fn(),
			onDeposit: fn(),
			onWithdraw: fn()
		}
	});
</script>

<Story
	name="PositiveBalance"
	args={{ balance: 12500, onSetBalance: fn(), onDeposit: fn(), onWithdraw: fn() }}
/>

<Story
	name="NegativeBalance"
	args={{ balance: -5000, onSetBalance: fn(), onDeposit: fn(), onWithdraw: fn() }}
/>

<Story
	name="ZeroBalance"
	args={{ balance: 0, onSetBalance: fn(), onDeposit: fn(), onWithdraw: fn() }}
/>
