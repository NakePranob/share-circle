import { SvelteSet, SvelteDate } from 'svelte/reactivity';
import { iOweForRound, totalIReceive, totalIOwe } from '$features/groups/utils/calculators';

export interface RoundForm {
	date: string;
	paymentAmount: number;
	receiveAmount: number;
	isMyRound: boolean;
}

type PlayMode = 'fixed' | 'stepped';

export function useGroupForm() {
	let groupName = $state('');
	let errors = $state<Record<string, string>>({});

	// Group settings
	let totalRounds = $state(10);
	let playMode = $state<PlayMode>('fixed');
	let frequency = $state(30); // days
	let receiveAmountPerRound = $state(50000);
	let startDate = $state(new SvelteDate().toISOString().split('T')[0]);

	// Fixed mode settings
	let fixedPaymentAmount = $state(1000);

	// Stepped mode settings
	let steppedPayments = $state<number[]>([]);

	// Round selection
	const selectedRounds = new SvelteSet<number>();

	// Generate rounds based on settings
	const rounds = $derived<RoundForm[]>((() => {
		const result: RoundForm[] = [];

		for (let i = 0; i < totalRounds; i++) {
			const date = new SvelteDate(startDate);
			date.setDate(date.getDate() + (i * frequency));
			const dateStr = date.toISOString().split('T')[0];

			const paymentAmount = playMode === 'fixed' ? fixedPaymentAmount : (steppedPayments[i] ?? 0);

			result.push({
				date: dateStr,
				paymentAmount,
				receiveAmount: receiveAmountPerRound,
				isMyRound: selectedRounds.has(i)
			});
		}

		return result;
	})());

	// Initialize stepped payments when switching to stepped mode
	$effect(() => {
		if (playMode === 'stepped' && steppedPayments.length !== totalRounds) {
			steppedPayments = Array.from({ length: totalRounds }, (_, i) => (i + 1) * 100);
		}
	});

	// Preview as Group-like object for calculations
	const previewRounds = $derived(
		rounds.map((r, i) => ({
			roundNumber: i + 1,
			date: r.date,
			paymentAmount: r.paymentAmount,
			receiveAmount: r.receiveAmount,
			status: 'pending' as const,
			isMyRound: r.isMyRound
		}))
	);

	const previewGroup = $derived({ id: '', name: '', rounds: previewRounds, createdAt: '', isActive: true });

	const myRoundNums = $derived(previewRounds.filter((r) => r.isMyRound).map((r) => r.roundNumber));
	const owePerRound = $derived(iOweForRound(previewGroup));
	const sumReceive = $derived(totalIReceive(previewGroup));
	const sumOwe = $derived(totalIOwe(previewGroup));

	function validate(): boolean {
		const errs: Record<string, string> = {};
		if (!groupName.trim()) errs.name = 'กรุณากรอกชื่อวง';
		if (totalRounds < 2) errs.rounds = 'ต้องมีอย่างน้อย 2 มือ';
		if (receiveAmountPerRound <= 0) errs.receiveAmount = 'ยอดรับต้องมากกว่า 0';
		if (playMode === 'fixed' && fixedPaymentAmount <= 0) errs.fixedPayment = 'ยอดจ่ายต้องมากกว่า 0';
		if (playMode === 'stepped' && steppedPayments.some((p) => p <= 0)) errs.steppedPayments = 'ยอดจ่ายทุกมือต้องมากกว่า 0';
		if (selectedRounds.size === 0) errs.myRound = 'เลือกมือที่เราได้รับอย่างน้อย 1 มือ';
		errors = errs;
		return Object.keys(errs).length === 0;
	}

	function toggleRound(i: number) {
		if (selectedRounds.has(i)) {
			selectedRounds.delete(i);
		} else {
			selectedRounds.add(i);
		}
	}

	return {
		get groupName() { return groupName; },
		set groupName(v: string) { groupName = v; },
		get errors() { return errors; },
		get totalRounds() { return totalRounds; },
		set totalRounds(v: number) { totalRounds = v; },
		get playMode() { return playMode; },
		set playMode(v: PlayMode) { playMode = v; },
		get frequency() { return frequency; },
		set frequency(v: number) { frequency = v; },
		get receiveAmountPerRound() { return receiveAmountPerRound; },
		set receiveAmountPerRound(v: number) { receiveAmountPerRound = v; },
		get startDate() { return startDate; },
		set startDate(v: string) { startDate = v; },
		get fixedPaymentAmount() { return fixedPaymentAmount; },
		set fixedPaymentAmount(v: number) { fixedPaymentAmount = v; },
		get steppedPayments() { return steppedPayments; },
		set steppedPayments(v: number[]) { steppedPayments = v; },
		get selectedRounds() { return selectedRounds; },
		get rounds() { return rounds; },
		get previewRounds() { return previewRounds; },
		get myRoundNums() { return myRoundNums; },
		get owePerRound() { return owePerRound; },
		get sumReceive() { return sumReceive; },
		get sumOwe() { return sumOwe; },
		validate,
		toggleRound
	};
}
