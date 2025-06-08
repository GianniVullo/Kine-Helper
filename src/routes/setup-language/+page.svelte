<script>
	import { goto } from '$app/navigation';
	import { locale, dictionnary } from '../../lib/i18n';
	import { supabase } from '../../lib';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { writable } from 'svelte/store';
	import { CircleArrowIcon } from '../../lib/ui/svgs/index';
	import { writeTextFile } from '@tauri-apps/plugin-fs';
	import { appLocalDataDir, BaseDirectory } from '@tauri-apps/api/path';
	import { tick } from 'svelte';

	let items = writable(['FR', 'NL', 'DE', 'EN']);
	let message;

	async function onSelectedLanguage(selectedLocale) {
		console.log('selectedLocale', selectedLocale);
		let button = document.getElementById(selectedLocale);
		let buttonSpinner = document.getElementById(`inner-${selectedLocale}`);
		button.disabled = true;
		await tick();
		buttonSpinner.className += ' !flex';
		// D'abord on met à jour l'interfae
		items.set([selectedLocale]);

		// Ensuite on va chercher sur le serveur la dernière version des traductions en 2 étapes : d'abord query le JSON des traductions (similaire au json des update de Tauri)
		// Finalement on va faire ça avec la DB
		let { data, error } = await supabase.from('translations').select().eq('code', selectedLocale);
		console.log('data', data);
		console.log('error', error);
		if (error) {
			console.error('error', error);
			message = `
                <div class="flex flex-col space-y-2">
                    <h5>Erreur lors de la récupération des traductions, veuillez réessayer plus tard</h5>
                    <h5>Fout bij het ophalen van vertalingen, probeer het later opnieuw</h5>
                    <h5>Fehler beim Abrufen von Übersetzungen, bitte versuchen Sie es später erneut</h5>
                    <h5>Error retrieving translations, please try again later</h5>
                </div>
            `;
			button.disabled = false;
			return;
		}
		let translation = data[0];
		console.log('translation', translation);

		// Finalement on va travailler avec un bête json stocker dans applocalDataDir
		// d'abord on créer un object JS pour modéliser le json
		let transFile = {
			defaultLocale: selectedLocale,
			translations: {}
		};
		transFile.translations[selectedLocale] = translation.translation;
		transFile.translations[selectedLocale].version = translation.version;
		dictionnary.update((d) => {
			d[selectedLocale] = transFile.translations[selectedLocale];
			return d;
		});
		console.log('transFile', transFile);
		console.log('dictionnary', $dictionnary);
		try {
			await writeTextFile(`settings.json`, JSON.stringify(transFile), {
				baseDir: BaseDirectory.AppLocalData
			});
		} catch (error) {
			console.log('Error writing settings.json', error);
		}
		// Ensuite on va mettre à jour le store des traductions
		locale.set(selectedLocale);
		// enfin on transitionne vers la nouvelle page
		goto('/');
	}
</script>

<div class="flex h-full w-full flex-col items-center justify-center space-y-4">
	{#if message}
		<div class="flex flex-col space-y-4">
			{@html message}
			<button
				on:click={() => onSelectedLanguage(items[0])}
				class="variant-filled btn-icon !rounded-lg"><CircleArrowIcon class="h-5 w-5" /></button>
		</div>
	{:else}
		{#if $items.length > 1}
			<div class="flex flex-col items-center justify-center">
				<h5>S'il vous plait, veuillez choisir une langue</h5>
				<h5>Alsjeblieft, kies een taal</h5>
				<h5>Bitte wählen Sie eine Sprache</h5>
				<h5>Please, choose a language</h5>
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center">
				<h5>Chargement et configuration de la langue</h5>
				<h5>Taal laden en instellen</h5>
				<h5>Sprache laden und einrichten</h5>
				<h5>Loading and setting language up</h5>
			</div>
		{/if}
		<div
			class="flex h-28 w-1/2 snap-x snap-mandatory items-center justify-center space-x-4 overflow-scroll">
			{#each $items as item (item)}
				<button
					id={item}
					animate:flip={{ duration: 200, easing: cubicOut }}
					on:click={() => onSelectedLanguage(item)}
					class="card dark:!bg-surface-200 dark:text-surface-800 relative snap-center !rounded-lg p-4 font-bold duration-200 hover:scale-125">
					<div
						id={`inner-${item}`}
						class="absolute top-[50%] left-[50%] hidden translate-x-[-50%] translate-y-[-50%] items-center justify-center duration-150">
						<div
							class="border-secondary-500 h-10 w-10 animate-spin rounded-full border-2 border-l-purple-500">
						</div>
					</div>
					<div id={`inner-${item}`}>{item}</div></button>
			{/each}
		</div>
	{/if}
</div>
