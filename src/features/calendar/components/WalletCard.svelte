<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Wallet, Plus, Minus } from '@lucide/svelte';
	import { formatCurrency } from '$lib/utils/calculator';

	interface Props {
		balance: number;
		onSetBalance: () => void;
		onDeposit: () => void;
		onWithdraw: () => void;
	}

	let { balance, onSetBalance, onDeposit, onWithdraw }: Props = $props();

	function currentBalance() {
		return balance < 0 ? 'text-red-500' : '';
	}
</script>

<Card class="mb-4 bg-foreground text-background">
	<CardHeader class="pb-2">
		<CardTitle class="flex items-center gap-2 text-base">
			<Wallet class="h-4 w-4" />
			กระเป๋าเงิน
		</CardTitle>
	</CardHeader>
	<CardContent>
		<p class="mb-3 text-3xl font-bold {currentBalance()}">{formatCurrency(balance)}</p>
		<div class="flex gap-2 text-foreground">
			<Button variant="outline" size="sm" onclick={onSetBalance} class="flex-1">
				ตั้งทุน
			</Button>
			<Button variant="outline" size="sm" onclick={onDeposit} class="flex-1">
				<Plus class="mr-1 h-3 w-3" />
				เติม
			</Button>
			<Button variant="outline" size="sm" onclick={onWithdraw} class="flex-1">
				<Minus class="mr-1 h-3 w-3" />
				เบิก
			</Button>
		</div>
	</CardContent>
</Card>
