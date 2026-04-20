import { walletStore } from '$features/wallet/stores/wallet.svelte';
import { toast } from 'svelte-sonner';

export function useWalletActions() {
	let showBalanceDialog = $state(false);
	let showDepositDialog = $state(false);
	let showWithdrawDialog = $state(false);
	let balanceInput = $state(walletStore.wallet.initialBalance);
	let txnAmount = $state(0);
	let txnNote = $state('');

	const wallet = $derived(walletStore.wallet);

	function saveBalance() {
		walletStore.setInitialBalance(balanceInput);
		toast.success('ตั้งทุนเรียบร้อย');
		showBalanceDialog = false;
	}

	function deposit() {
		if (txnAmount <= 0) return;
		walletStore.addTransaction('deposit', txnAmount, txnNote);
		toast.success('เติมเงินเรียบร้อย');
		showDepositDialog = false;
		txnAmount = 0;
		txnNote = '';
	}

	function withdraw() {
		if (txnAmount <= 0) return;
		walletStore.addTransaction('withdrawal', txnAmount, txnNote);
		toast.success('เบิกเงินเรียบร้อย');
		showWithdrawDialog = false;
		txnAmount = 0;
		txnNote = '';
	}

	function openBalanceDialog() {
		balanceInput = wallet.initialBalance;
		showBalanceDialog = true;
	}

	function openDepositDialog() {
		txnAmount = 0;
		txnNote = '';
		showDepositDialog = true;
	}

	function openWithdrawDialog() {
		txnAmount = 0;
		txnNote = '';
		showWithdrawDialog = true;
	}

	return {
		get wallet() { return wallet; },
		get showBalanceDialog() { return showBalanceDialog; },
		set showBalanceDialog(v: boolean) { showBalanceDialog = v; },
		get showDepositDialog() { return showDepositDialog; },
		set showDepositDialog(v: boolean) { showDepositDialog = v; },
		get showWithdrawDialog() { return showWithdrawDialog; },
		set showWithdrawDialog(v: boolean) { showWithdrawDialog = v; },
		get balanceInput() { return balanceInput; },
		set balanceInput(v: number) { balanceInput = v; },
		get txnAmount() { return txnAmount; },
		set txnAmount(v: number) { txnAmount = v; },
		get txnNote() { return txnNote; },
		set txnNote(v: string) { txnNote = v; },
		saveBalance,
		deposit,
		withdraw,
		openBalanceDialog,
		openDepositDialog,
		openWithdrawDialog
	};
}
