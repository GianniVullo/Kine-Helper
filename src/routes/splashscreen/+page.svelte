<script>
	import { goto } from '$app/navigation';
	import { t, dictionnary } from '../../lib/i18n';
	import { check } from '@tauri-apps/plugin-updater';
	import { relaunch } from '@tauri-apps/plugin-process';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { blur } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { supabase } from '../../lib';
	import Spiner from '../../lib/cloud/components/layout/Spiner.svelte';
	import { platform } from '@tauri-apps/plugin-os';
	import Database from '@tauri-apps/plugin-sql';
	import { info } from '../../lib/cloud/libraries/logging';

	// <!--* Idée de ce composant -->
	// Ici il faut attendre que le Dom soit complètement chargé pour éviter tout flickering.
	// Ensuite, il faut vérifier si une mise à jour est disponible.
	// Si une mise à jour est disponible, il faut télécharger et installer.
	// Ensuite, il faut relancer l'application Ou poursuivre vers l'écran de login.

	let loadingStatus = $state([]);
	let domLoaded = $state(false);
	let updatePromise = $state();
	let langPromise = $state();
	let contentSize;
	let indexOfContentDownload;
	onMount(() => {
		info('splashscreen mounted');
		const myEvent = new CustomEvent('svelteLoaded', {
			detail: { key: 'value' }
		});
		domLoaded = true;
		loadingStatus.push(`${get(t)('splash', 'domLoaded', null, 'DOM loaded')}`);
		// Dispatching the event from the document
		document.dispatchEvent(myEvent);
		updatePromise = lookingForUpdateAndInstallOrContinue();
	});
	// <!--* Initialization et mise-à-jour de l'application -->
	function lookingForUpdateAndInstallOrContinue() {
		return new Promise((resolve, reject) => {
			info('initializing check');
			const platformName = platform();
			if (platformName !== 'ios' && platformName !== 'android') {
				check()
					.then((update) => {
						info('update', update);
						// <!--? Si une MAJ est trouvée -->
						if (update?.available) {
							// <!--? ETAPE 1 : Update l'UI pour signaler le téléchargement -->
							loadingStatus.push(
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
										loadingStatus.push('0 %');
										indexOfContentDownload = loadingStatus.indexOf('0 %');
									}
									if (progress.event === 'Progress') {
										loadingStatus[indexOfContentDownload] =
											`${(progress.data.chunkLength / contentSize) * 100} %`;
									}
									if (progress.event === 'Finished') {
										loadingStatus[indexOfContentDownload] = 'DOWNLOAD COMPLETED !';
									}
								})
								.then(() => {
									loadingStatus.push(
										`${get(t)('splash', 'done', null, 'Download done, restarting ...')}`
									);
									// <!--? ETAPE 3 : relancer l'application -->
									relaunch();
									resolve();
								})
								.catch((e) => {
									info('erreur dans le downloadAndInstall', e);
								});
						} else {
							// <!--? Si aucune MAJ n'est trouvée -->
							loadingStatus.push(`${get(t)('splash', 'uptodate', null, "App's up to date.")}`);
							langPromise = new Promise(updateLang);
							resolve();
						}
					})
					.catch((e) => {
						console.error(e);
						// <!--? Si aucune MAJ n'est trouvée -->
						loadingStatus.push(
							// `${get(t)('splash', 'error', null, 'Error encountered, Retry later.')}`
							e
						);
					});
			} else {
				info('Mobile platform detected, skipping update check and going to lang update');
				loadingStatus.push(
					`${get(t)('splash', 'mobilePlatform', null, 'Mobile platform detected, skipping update check')}`
				);
				langPromise = new Promise(updateLang);
				resolve();
			}
		});
	}

	async function updateLang(resolve, reject) {
		info('updateLangPromise');
		// D'abord vérifier si le fichier /settings.json existe
		info('Checking if translations are already in the database');
		let settingsExists = false;
		let db;
		let translations;
		try {
			db = await Database.load('sqlite:kinehelper2.db');
			info('db loaded', db);
			translations = await db.select('SELECT * FROM translations');
			info('translations', translations);
			settingsExists = translations.length > 0;
		} catch (error) {
			info('Error loading database', error);
		}
		info('settingsExists', settingsExists);
		if (settingsExists) {
			translations = translations.map((t) => {
				t.translation = JSON.parse(t.translation);
				return t;
			});
			let defaultTranslation = translations.find((t) => t.is_default);
			let currentVersion = defaultTranslation.version;
			info('currentVersion', currentVersion);
			// On call l'API pour récupérer la version la plus récente du fichier de traduction et on compare avec la version actuelle.
			const { data, error } = await supabase
				.from('translations')
				.select('version')
				.eq('code', defaultTranslation.code);
			info('data', data);
			info('error', error);
			if (error) {
				// if error let's not block users because the i18n is supposed to be optional (through the fallback args from $t)
				goto('/');
				return resolve();
			}
			let newVersion = data[0].version;
			info('newVersion', newVersion);
			if (newVersion > currentVersion) {
				// Si la version est différente
				loadingStatus.push(
					`${get(t)('splash', 'langDownload', null, 'Downloading new translations')}`
				);
				// On télécharge le nouveaux dictionnaire
				let newDictionnary = await queryDictionnary(defaultTranslation.code);
				if (!newDictionnary) {
					// Pareil, on abandonne.
					goto('/');
					resolve();
					return;
				}
				dictionnary.update((d) => {
					d[defaultTranslation.code] = newDictionnary.translation;
					return d;
				});
				// We cache it in sqlite
				await db.execute('UPDATE translations SET translation = ?, version = ? WHERE code = ?', [
					JSON.stringify(newDictionnary.translation),
					newVersion,
					defaultTranslation.code
				]);
				await db.close();
			}
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
		info('data', data);
		info('error', error);
		if (error) {
			// Pareil, tant pis on abandonne
			return;
		}
		return data[0];
	}
</script>

<!-- <button class="bg-amber-50" onclick={() => {}}>TEST</button> -->

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-500 dark:from-purple-700 dark:to-indigo-700">
	<!--? CENTERED CARD -->
	<div
		style="height: 500px;"
		class="relative w-[350px] space-y-2 overflow-hidden bg-gray-50 px-6 py-4 dark:border dark:border-gray-400">
		<div
			class="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-purple-600 opacity-25 dark:opacity-50">
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
					{#if domLoaded}
						<Spiner />
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-7 w-7 stroke-indigo-300"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
					{/if}
				</div>
				<div class="flex items-center justify-between">
					<h5>{$t('splash', 'update', null, 'Looking for updates')}</h5>
					{#key updatePromise}
						{#if updatePromise}
							{#await updatePromise}
								<div
									style="margin: 5px;"
									class="border-secondary-500 h-5 w-5 animate-spin rounded-full border-2 border-t-purple-500 text-4xl">
								</div>
							{:then _}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="stroke-secondary-300 h-7 w-7"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
							{:catch error}
								<p>{error}</p>
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
									class="border-secondary-500 h-5 w-5 animate-spin rounded-full border-2 border-t-purple-500 text-4xl">
								</div>
							{/await}
						{:else}
							<p>-</p>
						{/if}
					{/key}
				</div>
				<div class="flex flex-col">
					<h5 class="text-surface-600 dark:text-surface-200 mb-1">
						{$t('splash', 'status', null, 'Status')}
					</h5>
					<ul class="text-surface-700 dark:text-surface-300 ml-2 flex flex-col text-sm">
						{#each loadingStatus as status, idx (idx)}
							<li transition:blur={{ duration: 500, easing: cubicOut }}>{status}</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>
