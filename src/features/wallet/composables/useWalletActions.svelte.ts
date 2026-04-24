import { useWalletStore } from '$features/wallet/stores/wallet.svelte';
import { toast } from 'svelte-sonner';
import { TOAST_MESSAGES, ERROR_MESSAGES } from '$features/wallet/constants';
import { TRANSACTION_TYPE } from '$features/wallet/types';

export function useWalletActions() {
	const walletStore = useWalletStore();
	let showBalanceDialog = $state(false);
	let showDepositDialog = $state(false);
	let showWithdrawDialog = $state(false);
	let balanceInput = $state(walletStore.wallet.initialBalance);
	let txnAmount = $state(0);
	let txnNote = $state('');

	const wallet = $derived(walletStore.wallet);

	async function saveBalance() {
		await walletStore.setInitialBalance(balanceInput);
		toast.success(TOAST_MESSAGES.SET_INITIAL_BALANCE);
		showBalanceDialog = false;
	}

	async function deposit() {
		if (txnAmount <= 0) {
			toast.error(ERROR_MESSAGES.INVALID_AMOUNT);
			return;
		}
		await walletStore.addTransaction(TRANSACTION_TYPE.DEPOSIT, txnAmount, txnNote);
		await walletStore.adjustBalance(+txnAmount);
		toast.success('เติมเงินเรียบร้อย');
		showDepositDialog = false;
		txnAmount = 0;
		txnNote = '';
	}

	async function withdraw() {
		if (txnAmount <= 0) {
			toast.error(ERROR_MESSAGES.INVALID_AMOUNT);
			return;
		}
		await walletStore.addTransaction(TRANSACTION_TYPE.WITHDRAWAL, txnAmount, txnNote);
		await walletStore.adjustBalance(-txnAmount);
		toast.success(TOAST_MESSAGES.WITHDRAW);
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
