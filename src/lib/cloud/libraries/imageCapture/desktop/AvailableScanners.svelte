<script>
	/**
	 ** - lancer la recherche de scanner
	 ** - Fetch le scanner ar défault dans le keyStore
	 ** - Afficher les résultats ou un message d'erreur avec un bouton de retry
	 */
	import { listen } from '@tauri-apps/api/event';
	import BoutonPrincipal from '../../../../components/BoutonPrincipal.svelte';
	import { invoke } from '@tauri-apps/api/core';
	import { ArrowCircle, successIcon } from '../../../../ui/svgs/IconSnippets.svelte';
	import { appState } from '../../../../managers/AppState.svelte';
	import { ScannerAPI } from '../desktop.svelte';

	let { afterScan, documentName, documentPath, onerror } = $props();

	let scannerAPI = new ScannerAPI();

	let stepIndex = $state(0);
</script>

<!--* ici il faut mettre le await seulement sur une partie de l'UI qui affiche le statut de la promesse et le ul se remplira au fil de l'avancée  -->
<p class="mb-4 text-gray-900">
	Choisissez un scanner puis cliquez sur le bouton 'Scanner' pour lancer le scan. <br /> Une fois le
	scan terminé, le fichier sera automatiquement ajouté à la prescription.
</p>
{#if stepIndex === 0}
	{#await scannerAPI.lookingForScanners()}
		<div class="flex">
			{@render ArrowCircle('size-6 text-gray-500 animate-spin')}
			<p>looking for scanners...</p>
		</div>
	{:then _}
		recherche terminée
	{:catch error}
		{#if scannerAPI.scanners.length === 0}
			<p>{error}</p>
		{/if}
	{/await}

	<h5 class="mt-4 mb-2 font-medium">Scanners disponibles</h5>
	<ul
		role="list"
		class="mb-5 divide-y divide-gray-100 overflow-hidden bg-white shadow-xs ring-1 ring-gray-900/5 sm:rounded-xl">
		{#each scannerAPI.scanners as scanner}
			<div class="flex space-x-6">
				<button
					onclick={(e) => {
						e.preventDefault();
						scannerAPI.selectedScanner = scanner;
					}}
					class="relative flex w-full justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
					<p
						class={[
							'text-left text-sm/6 font-semibold',
							scannerAPI.selectedScanner === scanner ? 'text-indigo-700' : 'text-gray-900'
						]}>
						<span class="absolute inset-x-0 -top-px bottom-0"></span>
						{scanner}
					</p>
					<div class="flex shrink-0 items-center gap-x-4">
						<div class="flex sm:flex-col sm:items-end">
							{#if scanner === scannerAPI.defaultScanner}
								<span
									class="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
									>Default scanner</span>
							{/if}
						</div>
						{#if scannerAPI.selectedScanner === scanner}
							{@render successIcon('size-6 flex-none text-indigo-700')}
						{:else}
							<svg
								class="size-5 flex-none text-gray-400"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
								data-slot="icon">
								<path
									fill-rule="evenodd"
									d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
									clip-rule="evenodd" />
							</svg>
						{/if}
					</div>
				</button>
				{#if scannerAPI.selectedScanner}
					<BoutonPrincipal
						className="rounded-l-none"
						onclick={async (e) => {
							e.preventDefault();
							e.target.disabled = true;
							console.log(
								'sending scan request with scanner:',
								scannerAPI.selectedScanner,
								documentName,
								documentPath
							);
							await scannerAPI.scan(documentName, documentPath, afterScan, onerror);
							stepIndex = 1;
						}}
						inner="Lancer le scan" />
				{/if}
			</div>
		{:else}
			<div class="flex space-x-4 items-center p-2">
				<p>Aucun scanner trouvé</p>
			</div>
		{/each}
	</ul>
{:else}
	<div class="flex">
		{@render ArrowCircle('size-6 text-gray-500 animate-spin')}
		<p>Awaiting for scan to complete...</p>
	</div>
{/if}
