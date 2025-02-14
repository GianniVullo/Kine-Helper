<script>
	import { goto } from '$app/navigation';
	import { t, dictionnary } from '../../lib/i18n';
	import { check } from '@tauri-apps/plugin-updater';
	import { relaunch } from '@tauri-apps/plugin-process';
	import { onMount } from 'svelte';
	import { get, writable } from 'svelte/store';
	import { appLocalDataDir } from '@tauri-apps/api/path';
	import { exists, writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
	import { read_file } from "../../lib/utils/fsAccessor";
	import { blur } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { supabase } from '../../lib';

	// <!--* Idée de ce composant -->
	// Ici il faut attendre que le Dom soit complètement chargé pour éviter tout flickering.
	// Ensuite, il faut vérifier si une mise à jour est disponible.
	// Si une mise à jour est disponible, il faut télécharger et installer.
	// Ensuite, il faut relancer l'application Ou poursuivre vers l'écran de login.

	let loadingStatus = writable([]);
	function pushToStatus(newStatus) {
		loadingStatus.update((status) => {
			status.push(newStatus);
			return status;
		});
	}
	let domLoaded = false;
	let updatePromise;
	let langPromise;
	let contentSize;
	let indexOfContentDownload;
	onMount(() => {
		const myEvent = new CustomEvent('svelteLoaded', {
			detail: { key: 'value' }
		});
		domLoaded = true;
		pushToStatus(`${get(t)('splash', 'domLoaded', null, 'DOM loaded')}`);
		// Dispatching the event from the document
		document.dispatchEvent(myEvent);
		updatePromise = lookingForUpdateAndInstallOrContinue();
	});
	// <!--* Initialization et mise-à-jour de l'application -->
	function lookingForUpdateAndInstallOrContinue() {
		return new Promise((resolve, reject) => {
			console.log('initializing check');
			check()
				.then((update) => {
					console.log('update', update);
					// <!--? Si une MAJ est trouvée -->
					if (update?.available) {
						// <!--? ETAPE 1 : Update l'UI pour signaler le téléchargement -->
						pushToStatus(
							`${get(t)(
								'splash',
								'download',
								null,
								"Downloading, the app's going to restart soon."
							)}`
						);
						// <!--? ETAPE 2 : télécharger et installer -->
						// TODO : mettre un timout reload, parce que si il y a un problème lors du fetch tout plante
						update
							.downloadAndInstall((progress) => {
								if (progress.event === 'Started') {
									contentSize = progress.data.contentLength;
									pushToStatus('0 %');
									indexOfContentDownload = $loadingStatus.indexOf('0 %');
								}
								if (progress.event === 'Progress') {
									$loadingStatus[indexOfContentDownload] =
										`${(progress.data.chunkLength / contentSize) * 100} %`;
								}
								if (progress.event === 'Finished') {
									$loadingStatus[indexOfContentDownload] = 'DOWNLOAD COMPLETED !';
								}
							})
							.then(() => {
								pushToStatus(`${get(t)('splash', 'done', null, 'Download done, restarting ...')}`);
								// <!--? ETAPE 3 : relancer l'application -->
								relaunch();
								resolve();
							})
							.catch((e) => {
								console.log('erreur dans le downloadAndInstall', e);
							});
					} else {
						// <!--? Si aucune MAJ n'est trouvée -->
						pushToStatus(`${get(t)('splash', 'uptodate', null, "App's up to date.")}`);
						langPromise = new Promise(updateLang);
						resolve();
					}
				})
				.catch((e) => {
					console.error(e);
					// <!--? Si aucune MAJ n'est trouvée -->
					pushToStatus(`${get(t)('splash', 'error', null, 'Error encountered, Retry later.')}`);
				});
		});
	}

	async function updateLang(resolve, reject) {
		console.log('updateLang');
		// D'abord vérifier si le fichier /settings.json existe
		let path = await appLocalDataDir();
		let settingsExists = await exists(`${path}/settings.json`);
		console.log('settingsExists', settingsExists);
		if (settingsExists) {
			// Si oui
			// On récupère la langue par défaut et la version du fichier de traduction présent sur le disque.
			const settingsFileContent = await read_file('settings.json');
			const textDecoder = new TextDecoder();
			const str = textDecoder.decode(settingsFileContent);
			console.log('The settings file content = ', str);
			const settings = JSON.parse(str);
			let currentVersion = settings.translations[settings.defaultLocale].version;
			console.log('currentVersion', currentVersion);
			// On call l'API pour récupérer la version la plus récente du fichier de traduction et on compare avec la version actuelle.
			const { data, error } = await supabase
				.from('translations')
				.select('version')
				.eq('code', settings.defaultLocale);
			console.log('data', data);
			console.log('error', error);
			if (error) {
				// Si il y a une erreur ici, ne bloquons pas la route de notre utilisateur. Tant pis pour cette fois.
				goto('/');
				resolve();
				return;
			}
			let newVersion = data[0].version;
			console.log('newVersion', newVersion);
			if (newVersion > currentVersion) {
				// Si la version est différente
				pushToStatus(`${get(t)('splash', 'langDownload', null, 'Downloading new translations')}`);
				// On télécharge le nouveaux dictionnaire
				let newDictionnary = await queryDictionnary(settings.defaultLocale);
				if (!newDictionnary) {
					// Pareil, on abandonne.
					goto('/');
					resolve();
					return;
				}
				// On remplace le dictionnaire par le nouveau dans l'objet settings
				settings.translations[settings.defaultLocale] = newDictionnary.translation;
				settings.translations[settings.defaultLocale].version = newVersion;
				// On remplace le dictionnaire par le nouveau dans le dictionnaire
				dictionnary.update((d) => {
					d[settings.defaultLocale] = newDictionnary.translation;
					return d;
				});
				// On écrit le fichier sur le disque
				await writeTextFile(`${path}/settings.json`, JSON.stringify(settings));
			}
			// On redirige vers la page de login.
		} else {
			// Si non
			// On abandonne tout et on redirige vers la page de sélection des langues
			goto('/setup-language');
			resolve();
			return;
		}
		// Quoi qu'il arrive, à la fin de tout ça...
		// On redirige vers la page de login.
		goto('/');
		resolve();
	}
	async function queryDictionnary(defaultLocale) {
		const { data, error } = await supabase.from('translations').select().eq('code', defaultLocale);
		console.log('data', data);
		console.log('error', error);
		if (error) {
			// Pareil, tant pis on abandonne
			return;
		}
		return data[0];
	}
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500 dark:from-primary-700 dark:to-secondary-700">
	<!--? CENTERED CARD -->
	<div
		style="height: 500px;"
		class="card relative w-[350px] space-y-2 overflow-hidden px-6 py-4 dark:border dark:border-gray-400">
		<div
			class="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-purple-600 opacity-25 dark:opacity-50">
		</div>
		<div
			class="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-sky-600 opacity-25 dark:opacity-60">
		</div>
		<div class="card-header">
			<h2 class="text-center text-5xl font-bold text-purple-600 dark:text-purple-400">
				Kiné Helper
			</h2>
			<p style="margin-top: 30px;" class="text-center text-2xl text-gray-600 dark:text-gray-300">
				{$t('login', 'subtitle', null, 'OpenSource and free for all physical therapists')}
			</p>
			<div id="status" class="mt-10 flex flex-col justify-center space-y-2 text-lg">
				<div class="flex items-center justify-between">
					<h5>{$t('splash', 'loading', null, 'Loading the DOM')}</h5>
					{@html domLoaded
						? '<div style="margin: 4px;" class="border-secondary-500 text-4xl w-5 h-5 border-2 rounded-full animate-spin border-b-primary-500"></div>'
						: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 stroke-secondary-300 h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>'}
				</div>
				<div class="flex items-center justify-between">
					<h5>{$t('splash', 'update', null, 'Looking for updates')}</h5>
					{#key updatePromise}
						{#if updatePromise}
							{#await updatePromise}
								<div
									style="margin: 5px;"
									class="h-5 w-5 animate-spin rounded-full border-2 border-secondary-500 border-t-primary-500 text-4xl">
								</div>
							{:then value}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-7 w-7 stroke-secondary-300"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
							{:catch error}
								<p>Error</p>
							{/await}
						{:else}
							<p>-</p>
						{/if}
					{/key}
				</div>
				<div class="flex items-center justify-between">
					<h5>{$t('splash', 'langUpdates', null, 'Updating translations')}</h5>
					{#key langPromise}
						{#if langPromise}
							{#await langPromise}
								<div
									style="margin: 5px;"
									class="h-5 w-5 animate-spin rounded-full border-2 border-secondary-500 border-t-primary-500 text-4xl">
								</div>
							{/await}
						{:else}
							<p>-</p>
						{/if}
					{/key}
				</div>
				<div class="flex flex-col">
					<h5 class="mb-1 text-surface-600 dark:text-surface-200">
						{$t('splash', 'status', null, 'Status')}
					</h5>
					<ul class="ml-2 flex flex-col text-sm text-surface-700 dark:text-surface-300">
						{#each $loadingStatus as status, idx (idx)}
							<li transition:blur={{ duration: 500, easing: cubicOut }}>{status}</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>
