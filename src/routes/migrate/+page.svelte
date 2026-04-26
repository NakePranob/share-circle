<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { useAuth } from '$features/auth/composables/useAuth.svelte';
	import { getOrCreateWallet } from '$lib/supabase/wallets';
	import { createTransaction } from '$lib/supabase/transactions';
	import { createGroup } from '$lib/supabase/groups';
	import { createRound } from '$lib/supabase/rounds';

	const auth = useAuth();

	let status = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
	let progress = $state(0);
	let message = $state('');
	let error = $state('');

	onMount(() => {
		if (!auth.isAuthenticated) {
			window.location.href = '/auth/login';
		}
	});

	async function migrate() {
		status = 'loading';
		progress = 0;
		message = 'เริ่ม migration...';
		error = '';

		try {
			const userId = auth.userId;
			if (!userId) throw new Error('ไม่พบ user ID');

			// Step 1: Read data from localStorage
			message = 'อ่านข้อมูลจาก localStorage...';
			progress = 10;

			const groupsData = localStorage.getItem('share-circle-groups');
			const walletData = localStorage.getItem('share-circle-wallet');

			if (!groupsData && !walletData) {
				throw new Error('ไม่พบข้อมูลใน localStorage');
			}

			const groups = groupsData ? JSON.parse(groupsData) : [];
			const wallet = walletData ? JSON.parse(walletData) : null;

			message = `พบ ${groups.length} groups และ wallet`;
			progress = 20;

			// Step 2: Migrate wallet
			if (wallet) {
				message = 'Migrate wallet...';
				progress = 30;

				await getOrCreateWallet(userId);

				// Step 3: Migrate manual transactions
				if (wallet.transactions && wallet.transactions.length > 0) {
					message = `Migrate ${wallet.transactions.length} transactions...`;
					progress = 40;

					for (const t of wallet.transactions) {
						await createTransaction({
							user_id: userId,
							group_id: t.groupId || null,
							round_number: t.roundNumber || null,
							date: t.date,
							type: t.type,
							amount: t.amount,
							is_estimate: t.isEstimate || false,
							note: t.note || null
						});
					}
				}

				progress = 50;
			}

			// Step 4: Migrate groups and rounds
			if (groups.length > 0) {
				message = `Migrate ${groups.length} groups...`;
				progress = 60;

				for (const group of groups) {
					// Create group
					const groupData = await createGroup({
						user_id: userId,
						name: group.name,
						is_active: group.isActive
					});

					const groupId = groupData.id;

					// Create rounds
					if (group.rounds && group.rounds.length > 0) {
						message = `Migrate ${group.rounds.length} rounds สำหรับ ${group.name}...`;
						progress = 60 + (groups.indexOf(group) / groups.length) * 30;

						for (const r of group.rounds) {
							await createRound({
								group_id: groupId,
								round_number: r.roundNumber,
								date: r.date,
								payment_amount: r.paymentAmount,
								receive_amount: r.receiveAmount,
								management_fee: r.managementFee || 0,
								status: r.status || 'pending',
								payout_status: r.payoutStatus || 'pending',
								is_my_round: r.isMyRound || false,
								paid_at: r.paidAt || null,
								received_at: r.receivedAt || null
							});
						}
					}
				}
			}

			// Step 5: Clear localStorage
			message = 'ลบข้อมูลจาก localStorage...';
			progress = 95;

			localStorage.removeItem('share-circle-groups');
			localStorage.removeItem('share-circle-wallet');

			message = 'Migration เสร็จสมบูรณ์!';
			progress = 100;
			status = 'success';

			toast.success('Migration เสร็จสมบูรณ์');
		} catch (e) {
			console.error('Migration error:', e);
			error = e instanceof Error ? e.message : 'Migration ล้มเหลว';
			status = 'error';
			toast.error('Migration ล้มเหลว');
		}
	}

	function clearLocalStorage() {
		if (confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลทั้งหมดจาก localStorage?')) {
			localStorage.removeItem('share-circle-groups');
			localStorage.removeItem('share-circle-wallet');
			toast.success('ลบข้อมูล localStorage เรียบร้อย');
		}
	}
</script>

<div class="mx-auto max-w-2xl p-6">
	<h1 class="mb-6 text-2xl font-bold">Migrate Data จาก localStorage ไป Supabase</h1>

	<div class="mb-6 rounded-lg border border-border bg-card p-6">
		<h2 class="mb-4 text-lg font-semibold">ข้อมูลที่จะ migrate</h2>
		<ul class="list-inside list-disc space-y-2 text-sm text-muted-foreground">
			<li>Groups และ Rounds</li>
			<li>Wallet และ Initial Balance</li>
			<li>Manual Transactions</li>
		</ul>
	</div>

	{#if status === 'idle'}
		<div class="space-y-4">
			<button
				onclick={migrate}
				class="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground hover:bg-primary/90"
			>
				เริ่ม Migration
			</button>

			<button
				onclick={clearLocalStorage}
				class="w-full rounded-lg border border-border bg-destructive/10 px-4 py-3 font-medium text-destructive hover:bg-destructive/20"
			>
				ลบข้อมูล localStorage (ไม่ migrate)
			</button>
		</div>
	{:else if status === 'loading'}
		<div class="space-y-4">
			<div class="h-2 w-full overflow-hidden rounded-full bg-secondary">
				<div class="h-full bg-primary transition-all" style="width: {progress}%"></div>
			</div>
			<p class="text-center text-sm text-muted-foreground">{message}</p>
			<p class="text-center text-lg font-semibold">{progress}%</p>
		</div>
	{:else if status === 'success'}
		<div
			class="rounded-lg border border-green-200 bg-green-50 p-6 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
		>
			<h2 class="mb-2 text-lg font-semibold">Migration เสร็จสมบูรณ์!</h2>
			<p class="text-sm">ข้อมูลทั้งหมดถูกย้ายไป Supabase แล้ว คุณสามารถใช้งานแอปได้ตามปกติ</p>
			<a
				href="/"
				class="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
			>
				กลับไปหน้าหลัก
			</a>
		</div>
	{:else if status === 'error'}
		<div
			class="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
		>
			<h2 class="mb-2 text-lg font-semibold">Migration ล้มเหลว</h2>
			<p class="mb-4 text-sm">{error}</p>
			<button
				onclick={() => (status = 'idle')}
				class="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
			>
				ลองใหม่
			</button>
		</div>
	{/if}
</div>
