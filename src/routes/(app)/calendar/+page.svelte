<script lang="ts">
	import { useGroupsStore } from '$features/groups/stores/groups.svelte';
	import { useWalletStore } from '$features/wallet/stores/wallet.svelte';
	import { useCalendar } from '$features/calendar/composables';
	import { useWalletActions } from '$features/wallet/composables';
	import WalletCard from '$features/calendar/components/WalletCard.svelte';

	const groupsStore = useGroupsStore();
	import CalendarGrid from '$features/calendar/components/CalendarGrid.svelte';
	import DaySheet from '$features/calendar/components/DaySheet.svelte';
	import WalletDialogs from '$features/wallet/components/WalletDialogs.svelte';
	import { toast } from 'svelte-sonner';
	import { TOAST_MESSAGES } from '$features/calendar/constants';

	const walletActions = useWalletActions();
	const walletStore = useWalletStore();
	const calendar = useCalendar();

	let sheetOpen = $state(false);

	async function markAsPaid(groupId: string, roundNumber: number) {
		const round = groupsStore.getById(groupId)?.rounds.find((r) => r.roundNumber === roundNumber);
		await groupsStore.markRoundPaid(groupId, roundNumber);
		if (round) {
			await walletStore.adjustBalance(-round.paymentAmount);
			await walletStore.addTransaction('payment', round.paymentAmount, '', groupId, roundNumber);
		}
		toast.success(TOAST_MESSAGES.MARK_AS_PAID);
		if (calendar.selectedDay) {
			calendar.selectedDay = calendar.projectedCashFlow.get(calendar.selectedDay.date) ?? null;
		}
	}

	async function markAsReceived(groupId: string, roundNumber: number) {
		const round = groupsStore.getById(groupId)?.rounds.find((r) => r.roundNumber === roundNumber);
		await groupsStore.markRoundReceived(groupId, roundNumber);
		if (round) {
			const net = round.receiveAmount - (round.managementFee ?? 0);
			await walletStore.adjustBalance(+net);
			await walletStore.addTransaction('payout', net, '', groupId, roundNumber);
		}
		toast.success(TOAST_MESSAGES.MARK_AS_RECEIVED);
		if (calendar.selectedDay) {
			calendar.selectedDay = calendar.projectedCashFlow.get(calendar.selectedDay.date) ?? null;
		}
	}

	function currentBalance() {
		return walletActions.wallet.initialBalance;
	}
</script>

<div class="p-4">
	<header class="mb-4">
		<h1 class="text-xl font-bold">ปฏิทินกระแสเงิน</h1>
	</header>

	<WalletCard
		balance={currentBalance()}
		onSetBalance={walletActions.openBalanceDialog}
		onDeposit={walletActions.openDepositDialog}
		onWithdraw={walletActions.openWithdrawDialog}
	/>

	<CalendarGrid
		calendarDays={calendar.calendarDays}
		monthLabel={calendar.monthLabel}
		projectedCashFlow={calendar.projectedCashFlow}
		groups={groupsStore.groups}
		todayStr={calendar.todayStr}
		onPrevMonth={calendar.prevMonth}
		onNextMonth={calendar.nextMonth}
		onClickDay={(date) => {
			calendar.clickDay(date);
			sheetOpen = true;
		}}
	/>
</div>

<DaySheet
	selectedDay={calendar.selectedDay}
	open={sheetOpen}
	groups={groupsStore.groups}
	onClose={() => {
		sheetOpen = false;
		setTimeout(() => {
			calendar.selectedDay = null;
		}, 300);
	}}
	onMarkAsPaid={markAsPaid}
	onMarkAsReceived={markAsReceived}
/>

<WalletDialogs actions={walletActions} />
