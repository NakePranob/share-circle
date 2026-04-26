<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { Wallet } from '$features/wallet/types';

	interface WalletDialogsActions {
		wallet: Wallet;
		showBalanceDialog: boolean;
		showDepositDialog: boolean;
		showWithdrawDialog: boolean;
		balanceInput: number;
		txnAmount: number;
		txnNote: string;
		saveBalance: () => Promise<void>;
		deposit: () => Promise<void>;
		withdraw: () => Promise<void>;
		openBalanceDialog: () => void;
		openDepositDialog: () => void;
		openWithdrawDialog: () => void;
	}

	interface Props {
		actions: WalletDialogsActions;
	}

	let { actions }: Props = $props();
</script>

<!-- Set balance dialog -->
<Dialog.Root open={actions.showBalanceDialog} onOpenChange={(o) => (actions.showBalanceDialog = o)}>
	<Dialog.Content class="max-w-sm">
		<Dialog.Header>
			<Dialog.Title>ตั้งทุนเริ่มต้น</Dialog.Title>
		</Dialog.Header>
		<div class="space-y-3">
			<Label for="balance">ยอดเงิน (บาท)</Label>
			<Input id="balance" type="number" bind:value={actions.balanceInput} />
		</div>
		<Dialog.Footer>
			<Button onclick={actions.saveBalance}>บันทึก</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Deposit dialog -->
<Dialog.Root open={actions.showDepositDialog} onOpenChange={(o) => (actions.showDepositDialog = o)}>
	<Dialog.Content class="max-w-sm">
		<Dialog.Header>
			<Dialog.Title>เติมเงิน</Dialog.Title>
		</Dialog.Header>
		<div class="space-y-3">
			<div class="space-y-2">
				<Label for="deposit-amount">จำนวน (บาท)</Label>
				<Input id="deposit-amount" type="number" min="1" bind:value={actions.txnAmount} />
			</div>
			<div class="space-y-2">
				<Label for="deposit-note">หมายเหตุ (ไม่บังคับ)</Label>
				<Input id="deposit-note" bind:value={actions.txnNote} placeholder="เช่น โบนัส" />
			</div>
		</div>
		<Dialog.Footer>
			<Button onclick={actions.deposit} disabled={actions.txnAmount <= 0}>เติม</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Withdraw dialog -->
<Dialog.Root
	open={actions.showWithdrawDialog}
	onOpenChange={(o) => (actions.showWithdrawDialog = o)}
>
	<Dialog.Content class="max-w-sm">
		<Dialog.Header>
			<Dialog.Title>เบิกเงิน</Dialog.Title>
		</Dialog.Header>
		<div class="space-y-3">
			<div class="space-y-2">
				<Label for="withdraw-amount">จำนวน (บาท)</Label>
				<Input id="withdraw-amount" type="number" min="1" bind:value={actions.txnAmount} />
			</div>
			<div class="space-y-2">
				<Label for="withdraw-note">หมายเหตุ (ไม่บังคับ)</Label>
				<Input id="withdraw-note" bind:value={actions.txnNote} placeholder="เช่น ค่าใช้จ่าย" />
			</div>
		</div>
		<Dialog.Footer>
			<Button onclick={actions.withdraw} disabled={actions.txnAmount <= 0} variant="destructive"
				>เบิก</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
