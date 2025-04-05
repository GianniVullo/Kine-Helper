<script>
	import { invoke } from '@tauri-apps/api/core';

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
	let responseFromCard = $state(invoke('get_eid_data'));
	let retryCount = 0;
	$effect(() => {
		responseFromCard
			.then((data) => {
				dataReceiver(data);
			})
			.catch((error) => {
				console.error('Error:', error);
				if (
					error == 'A smartcard is not present in the reader.' ||
					error == 'Cannot connect to Card'
				) {
					retryCount++;
					if (retryCount < 5) {
						responseFromCard = invoke('get_eid_data');
					}
				}
			});
	});
</script>

{#snippet retryButton()}
	<button
		class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
		onclick={() => {
			responseFromCard = invoke('get_eid_data');
		}}>
		Retry
	</button>
{/snippet}

{#await responseFromCard then _}
	<p class="mt-2 text-gray-500">Données reçues du lecteur de carte avec succès!</p>
{:catch error}
	{#if error === 'No readers are connected.'}
		<p class="text-grey-500">No readers are connected. Please connect a reader and try again.</p>
		{@render retryButton()}
	{:else if error === 'Cannot connect to Card' || error === 'A smartcard is not present in the reader.'}
		<p class="text-grey-500">No card found.</p>
		{@render retryButton()}
	{:else}
		<p class="text-grey-500">An error occurred: {error}</p>
		{@render retryButton()}
	{/if}
{/await}
