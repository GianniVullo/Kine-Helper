<script>
	import { appState } from '../../../../managers/AppState.svelte';

	const totalFacture = new Promise(async (resolve, reject) => {
		let { data: total, error } = await appState.db.select(
			"SELECT SUM(valeur_totale) as total FROM attestations WHERE user_id = $1 AND strftime('%Y',date) = strftime('%Y', 'now')",
			[appState.user.id]
		);
		if (total) {
			total = total[0].total;
		} else {
			total = 0;
		}
		if (error) {
			console.error('Error fetching total:', error);
			reject(error);
			return;
		}
		resolve(total);
	});
	const tatalFacturable = new Promise(async (resolve, reject) => {
		let { data: total, error } = await appState.db.select(
			'SELECT COUNT(*) as total FROM seances s WHERE s.user_id = $1 AND s.has_been_attested = 0',
			[appState.user.id]
		);
		console.log('total', total);
		if (total) {
			total = total[0].total;
		} else {
			total = 0;
		}
		if (error) {
			console.error('Error fetching total:', error);
			reject(error);
			return;
		}
		resolve(total);
	});

	const totalValeursM = new Promise(async (resolve, reject) => {
		let { data: total, error } = await appState.db.select(
			"SELECT SUM(c.valeur) as total FROM seances s JOIN codes c ON c.code_id = s.code_id WHERE user_id = $1 AND strftime('%Y',date) = strftime('%Y', 'now') AND s.has_been_attested = 1",
			[appState.user.id]
		);
		if (total) {
			total = total[0].total;
		} else {
			total = 0;
		}
		if (error) {
			console.error('Error fetching total:', error);
			reject(error);
			return;
		}
		resolve(total);
	});
</script>

<div>
	<h3 class="mt-10 text-base font-semibold text-gray-900">
		Pour l'année {new Date().getFullYear()}
	</h3>
	<dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
		<div class="overflow-hidden rounded-lg bg-gray-50 px-4 py-5 shadow-sm sm:p-6">
			<dt class="truncate text-sm font-medium text-gray-500">Total facturé</dt>
			<dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
				{#await totalFacture}
					<!-- totalFacture is pending -->
					<p class="text-sm text-gray-500">Loading...</p>
				{:then value}
					<!-- totalFacture was fulfilled -->
					{value} €
				{:catch error}
					<!-- totalFacture was rejected -->
					<p class="text-sm text-red-500">Error: {error}</p>
				{/await}
			</dd>
		</div>
		<div class="overflow-hidden rounded-lg bg-gray-50 px-4 py-5 shadow-sm sm:p-6">
			<dt class="truncate text-sm font-medium text-gray-500">Séances facturables</dt>
			<dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
				{#await tatalFacturable}
					<!-- tatalFacturable is pending -->
					<p class="text-sm text-gray-500">Loading...</p>
				{:then value}
					<!-- tatalFacturable was fulfilled -->
					{value}
					<span class="truncate text-sm font-medium tracking-normal text-gray-500">séances</span>
				{:catch error}
					<!-- tatalFacturable was rejected -->
					<p class="text-sm text-red-500">Error: {error}</p>
				{/await}
			</dd>
		</div>
		<div class="relative overflow-hidden rounded-lg bg-gray-50 px-4 py-5 shadow-sm sm:p-6">
			<dt class="truncate text-sm font-medium text-gray-500">Valeurs M</dt>
			<dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
				{#await totalValeursM}
					<!-- totalValeursM is pending -->
					<p class="text-sm text-gray-500">Loading...</p>
				{:then value}
					<!-- totalValeursM was fulfilled -->
					{value} <span class="text-sm font-medium tracking-normal text-gray-500">/ 156 000</span>
					{#if value > 150000}
						<p class="absolute top-0 right-0 mt-2 mr-2 text-xs font-semibold text-red-500">
							Attention, vous approchez le plafond légal !
						</p>
					{/if}
				{:catch error}
					<!-- totalValeursM was rejected -->
					<p class="text-sm text-red-500">Error: {error}</p>
				{/await}
			</dd>
		</div>
	</dl>
</div>
