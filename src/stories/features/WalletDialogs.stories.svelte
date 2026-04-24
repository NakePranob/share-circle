<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import WalletDialogs from '$features/wallet/components/WalletDialogs.svelte';

	const { Story } = defineMeta({
		title: 'Features/WalletDialogs',
		component: WalletDialogs,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

<Story name="Default">
	<WalletDialogs
		actions={{
			wallet: { initialBalance: 0, transactions: [] },
			showBalanceDialog: false,
			showDepositDialog: false,
			showWithdrawDialog: false,
			balanceInput: 0,
			txnAmount: 0,
			txnNote: '',
			saveBalance: async () => {},
			deposit: async () => {},
			withdraw: async () => {},
			openBalanceDialog: () => {},
			openDepositDialog: () => {},
			openWithdrawDialog: () => {}
		}}
	/>
</Story>
