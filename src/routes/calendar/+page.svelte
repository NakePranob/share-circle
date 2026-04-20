<script lang="ts">
	import { groupsStore } from '$features/groups/stores/groups.svelte';
	import { useCalendar } from '$features/calendar/composables/useCalendar.svelte';
	import { useWalletActions } from '$features/wallet/composables/useWalletActions.svelte';
	import WalletCard from '$features/calendar/components/WalletCard.svelte';
	import CalendarGrid from '$features/calendar/components/CalendarGrid.svelte';
	import DaySheet from '$features/calendar/components/DaySheet.svelte';
	import WalletDialogs from '$features/wallet/components/WalletDialogs.svelte';
	import { toast } from 'svelte-sonner';
	import { TOAST_MESSAGES } from '$features/calendar/constants';

	const walletActions = useWalletActions();
	const calendar = useCalendar(() => groupsStore.groups, walletActions.wallet);

	let sheetOpen = $state(false);

	function markAsPaid(groupId: string, roundNumber: number) {
		groupsStore.markRoundPaid(groupId, roundNumber);
		toast.success(TOAST_MESSAGES.MARK_AS_PAID);
		// Refresh the selected day data
		if (calendar.selectedDay) {
			calendar.selectedDay = calendar.cashFlow.get(calendar.selectedDay.date) ?? null;
		}
	}

	function currentBalance() {
		const todayData = calendar.paidCashFlow.get(calendar.todayStr);
		return todayData?.balance ?? walletActions.wallet.initialBalance;
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
		cashFlow={calendar.cashFlow}
		paidCashFlow={calendar.paidCashFlow}
		todayStr={calendar.todayStr}
		onPrevMonth={calendar.prevMonth}
		onNextMonth={calendar.nextMonth}
		onClickDay={(date) => { calendar.clickDay(date); sheetOpen = true; }}
	/>
</div>

<DaySheet
	selectedDay={calendar.selectedDay}
	open={sheetOpen}
	paidCashFlow={calendar.paidCashFlow}
	onClose={() => { sheetOpen = false; setTimeout(() => { calendar.selectedDay = null; }, 300); }}
	onMarkAsPaid={markAsPaid}
/>

<WalletDialogs actions={walletActions} />
