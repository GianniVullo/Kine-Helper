<script>
	import { invoke } from '@tauri-apps/api/core';
	import Spiner from '../components/layout/Spiner.svelte';
	import { tick } from 'svelte';

	let { dataReceiver } = $props();
	/**
	 ** - Check si il y a un lecteur de carte
	 ** - si non,
	 **     - on arrête tout
	 **     - on le signale
	 **     - on place un bouton pour relancer la recherche
	 ** - si oui,
	 **     - on lance la recherche de la carte
	 **     - Si il n'y a pas de carte
	 **         - on le signale
	 **         - on refetch pendant 5 secondes
	 **         - au bout des 5 secondes on place un bouton pour relancer la recherche
	 **     - si il y a une carte on envoie la réponse via dataReceiver
	 */

	let eidPromise = $state(
		new Promise(async (resolve, reject) => {
			await tick();
			let eidData;
			try {
				eidData = await new Promise(async (resolve2, reject2) => {
					let data;
					setTimeout(() => {
						if (!data) reject2('No data');
					}, 3000);
					try {
						data = await invoke('get_eid_data');
						clearTimeout();
						resolve2(data);
					} catch (error) {
						clearTimeout();
						reject2(error);
					}
				});
				console.log('EID Data:', eidData);
				dataReceiver(eidData);
				resolve(eidData);
			} catch (error) {
				reject(error);
			}
		})
	);
</script>

{#snippet cadre(completed, error)}
	<div class="col-span-full bg-gray-50 shadow-sm sm:rounded-lg md:col-span-3 dark:bg-gray-800">
		<div class="px-4 py-5 sm:p-6">
			<h3 class="text-base font-semibold text-gray-900 dark:text-white">Lecteur de carte eID</h3>
			<div class="mt-2 sm:flex sm:items-start sm:justify-between">
				<div class="max-w-xl text-sm text-gray-500">
					{#if completed}
						{#if error}
							{#if error === 'No readers are connected.'}
								<p>No readers are connected. Please connect a reader and try again.</p>
							{:else if error === 'Cannot connect to Card' || error === 'A smartcard is not present in the reader.'}
								<p>No card found.</p>
							{:else}
								<p>An error occurred: {error}</p>
							{/if}
						{:else}
							<p>Données reçues du lecteur de carte avec succès!</p>
						{/if}
					{:else}
						<p>Chargement des données depuis le lecteur de carte...</p>
					{/if}
				</div>
				<div class="mt-5 sm:mt-0 sm:ml-6 sm:flex sm:shrink-0 sm:items-center">
					{#if completed}
						<button
							type="button"
							onclick={() => {
								eidPromise = new Promise(async (resolve, reject) => {
									let eidData;
									try {
										eidData = await invoke('get_eid_data');
										console.log('EID Data:', eidData);
										dataReceiver(eidData);
										resolve(eidData);
									} catch (error) {
										reject(error);
									}
								});
							}}
							class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
							>Réessayer</button>
					{:else}
						<Spiner />
					{/if}
				</div>
			</div>
		</div>
	</div>
{/snippet}

{#await eidPromise}
	{@render cadre(false, null)}
{:then value}
	{console.log('Value:', value)}
	{@render cadre(true, null)}
{:catch error}
	{@render cadre(true, error)}
{/await}
