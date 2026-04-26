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

	// Business logic — no dialog side effects, usable independently
	async function setBalance(amount: number) {
		await walletStore.setInitialBalance(amount);
		toast.success(TOAST_MESSAGES.SET_INITIAL_BALANCE);
	}

	async function depositFunds(amount: number, note: string) {
		if (amount <= 0) {
			toast.error(ERROR_MESSAGES.INVALID_AMOUNT);
			return false;
		}
		await walletStore.addTransaction(TRANSACTION_TYPE.DEPOSIT, amount, note);
		await walletStore.adjustBalance(+amount);
		toast.success('เติมเงินเรียบร้อย');
		return true;
	}

	async function withdrawFunds(amount: number, note: string) {
		if (amount <= 0) {
			toast.error(ERROR_MESSAGES.INVALID_AMOUNT);
			return false;
		}
		await walletStore.addTransaction(TRANSACTION_TYPE.WITHDRAWAL, amount, note);
		await walletStore.adjustBalance(-amount);
		toast.success(TOAST_MESSAGES.WITHDRAW);
		return true;
	}

	// UI wrappers — call business fn, then close dialog + reset inputs
	async function saveBalance() {
		await setBalance(balanceInput);
		showBalanceDialog = false;
	}

	async function deposit() {
		const ok = await depositFunds(txnAmount, txnNote);
		if (ok) {
			showDepositDialog = false;
			txnAmount = 0;
			txnNote = '';
		}
	}

	async function withdraw() {
		const ok = await withdrawFunds(txnAmount, txnNote);
		if (ok) {
			showWithdrawDialog = false;
			txnAmount = 0;
			txnNote = '';
		}
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
		get wallet() {
			return wallet;
		},
		get showBalanceDialog() {
			return showBalanceDialog;
		},
		set showBalanceDialog(v: boolean) {
			showBalanceDialog = v;
		},
		get showDepositDialog() {
			return showDepositDialog;
		},
		set showDepositDialog(v: boolean) {
			showDepositDialog = v;
		},
		get showWithdrawDialog() {
			return showWithdrawDialog;
		},
		set showWithdrawDialog(v: boolean) {
			showWithdrawDialog = v;
		},
		get balanceInput() {
			return balanceInput;
		},
		set balanceInput(v: number) {
			balanceInput = v;
		},
		get txnAmount() {
			return txnAmount;
		},
		set txnAmount(v: number) {
			txnAmount = v;
		},
		get txnNote() {
			return txnNote;
		},
		set txnNote(v: string) {
			txnNote = v;
		},
		// UI actions
		saveBalance,
		deposit,
		withdraw,
		openBalanceDialog,
		openDepositDialog,
		openWithdrawDialog,
		// Business functions (testable independently)
		setBalance,
		depositFunds,
		withdrawFunds
	};
}
