<script>
	import { getModalStore } from '@skeletonlabs/skeleton';
	import SelectFieldV2 from '../../../lib/forms/abstract-fields/SelectFieldV2.svelte';
	import { writable } from 'svelte/store';
	import { t, locale, dictionnary } from '../../../lib/i18n';
	import { supabase } from '../../../lib';
	import { readTextFile, remove, writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
	import { appLocalDataDir } from '@tauri-apps/api/path';
	import { goto } from '$app/navigation';
	import PostSignupForm from '../../../lib/forms/authentication/PostSignupForm.svelte';
	import RadioFieldV2 from '../../../lib/forms/abstract-fields/RadioFieldV2.svelte';
	import { platform } from '@tauri-apps/plugin-os';
	import WindowsSelectionField from '../../../lib/forms/settings/WindowsSelectionField.svelte';
	import { toast } from '../../../lib/cloud/libraries/overlays/notificationUtilities.svelte';
	import { appState } from '../../../lib/managers/AppState.svelte';
	import { errorIcon, successIcon } from '../../../lib/ui/svgs/IconSnippets.svelte';

	const modalStore = getModalStore();
	let imprimanteMatricielleP = new Promise(async (resolve, reject) => {
		let { data: iM, error } = await appState.db.getRawPrinter();
		if (error) {
			console.log('error', error);
			reject(error);
		}
		imprimanteMatricielle = iM.name;
		pinNumber = JSON.parse(JSON.parse(iM.metadata).is_nine_pin);
		console.log(pinNumber);
		resolve(iM);
	});

	let imprimanteMatricielle = $state();
	let pinNumber = $state();

	async function changingLanguage(event) {
		const lang = event.target.value;
		if (lang === $locale) return;
		console.log('changing language to', lang);
		// d'abord on cherche si le dictionnaire se trouve déjà dans le cache
		if ($dictionnary[lang]) {
			console.log('dictionnary already in cache', $dictionnary[lang]);
			// On vérifie la version avec le serveur
			const { data: versionList } = await supabase
				.from('translations')
				.select('version')
				.eq('code', lang);
			//Si le dictionnaire n'a pas de version, on le télécharge directement
			if ($dictionnary[lang].version) {
				if (versionList[0].version === $dictionnary[lang].version) {
					locale.set(lang);
					goto('/dashboard/settings');
					return;
				}
			}
		}
		// si le dictionnaire n'est pas dans le cache ou n'a pas la même version, on le télécharge directement
		const { data } = await supabase.from('translations').select().eq('code', lang);
		console.log('new dictionnary', data[0]);
		// On met à jour le dictionnaire
		dictionnary.update((d) => {
			d[lang] = data[0].translation;
			return d;
		});
		// On met à jour le fichier sur le disque
		await saveToDisk(lang, data[0]);
	}
	async function saveToDisk(lang, data) {
		console.log('saving to disk with', lang, data);
		let path = await appLocalDataDir();
		let settingsJson = JSON.parse(await readTextFile(`${path}/settings.json`));
		console.log('settingsJson', settingsJson);
		settingsJson.translations[lang] = data.translation;
		settingsJson.translations[lang].version = data.version;
		settingsJson.defaultLocale = lang;
		await writeTextFile(`${path}/settings.json`, JSON.stringify(settingsJson));
		locale.set(lang);
	}

	async function nukeUsersData() {
		if (appState.user.offre !== 'cloud') {
			await db.list('patients', [['user_id', appState.user.id]], {
				selectStatement: 'patient_id'
			});
		}
		/*? Pour les utilisateurs du cloud il n'est pas nécessaire
		 * ? de "Nuke" les données puisque en supprimant l'utilisateur
		 * ? ON DELETE CASCADE va s'occuper de tout nuker tout seul.
		 */
		try {
			await remove(`settings.json`, { baseDir: BaseDirectory.AppLocalData });
		} catch (error) {
			console.log('error', error);
		}
		try {
			await remove(appState.user.id, {
				baseDir: BaseDirectory.AppLocalData,
				recursive: true
			});
		} catch (error) {
			console.log('error', error);
		}
		await supabase.auth.signOut();
		goto('/merci');
	}

	async function changePrinter() {
		if ((await appState.db.getRawPrinter()) === imprimanteMatricielle) return;

		const { data: _, error } = await appState.db.execute(
			'UPDATE appareils SET name = $1, metadata = $2 WHERE role = $3',
			[imprimanteMatricielle, JSON.stringify({ is_nine_pin: pinNumber }), 'raw_printer']
		);
		modified.set(false);
		if (!error) {
			toast.trigger({
				titre: 'Imprimante modifiée avec succès.',
				description: 'Vos attestations seront désormais imprimées sur ' + imprimanteMatricielle,
				leading: successIcon,
				leadingCSS: 'size-6 text-green-400',
				timeout: 3000
			});
		} else {
			toast.trigger({
				titre: 'Erreur!',
				description: error,
				leading: errorIcon,
				leadingCSS: 'size-6 text-red-400',
				timeout: 5000
			});
		}
	}
	let modified = writable(false);

	$effect(() => {
		imprimanteMatricielle;
		pinNumber;
		appState.db.getRawPrinter().then(({ data: value, error }) => {
			if (
				imprimanteMatricielle !== value.name ||
				pinNumber !== JSON.parse(JSON.parse(value.metadata).is_nine_pin)
			) {
				modified.set(true);
			} else {
				modified.set(false);
			}
		});
	});
</script>

<main class="flex h-full w-full flex-col items-start space-y-4 overflow-y-scroll">
	<div>
		<h1 class="text-lg text-surface-600 dark:text-surface-300">{$t('sidebar', 'settings')}</h1>
		<p class="text-surface-400">{$t('settings', 'description')}</p>
	</div>
	{#await imprimanteMatricielleP then _}
		<section class="flex flex-col items-start space-y-2">
			<h2 class="text-secondary-500 dark:text-secondary-300">{$t('settings', 'printer')}</h2>
			{#if platform() === 'windows'}
				<WindowsSelectionField
					cb={() => {
						console.log('in cb');

						modified.set(true);
					}}
					bind:printerField={imprimanteMatricielle} />
			{:else}
				<input
					class="input"
					type="text"
					name="printer"
					oninput={() => modified.set(true)}
					bind:value={imprimanteMatricielle} />
			{/if}
			<RadioFieldV2
				name="is_nine_pin"
				bind:value={pinNumber}
				inline
				label={$t('printerSetup', 'pins.label')}
				change={() => modified.set(true)}
				options={[
					{ value: true, label: '9' },
					{ value: false, label: '12/24' }
				]} />
			{#if $modified}
				<button onclick={changePrinter} class="variant-outline-primary btn btn-sm"
					>{$t('shared', 'save')}</button>
			{/if}
		</section>
	{:catch error}
		<p class="text-error-600">{error}</p>
	{/await}
	<section class="flex flex-col items-start space-y-2">
		<h2 class="text-secondary-500 dark:text-secondary-300">{$t('settings', 'lang')}</h2>
		<SelectFieldV2
			on:input={changingLanguage}
			value={$locale}
			name="lang"
			options={[
				{ value: 'FR', label: 'Français' },
				{ value: 'NL', label: 'Nederlands' },
				{ value: 'EN', label: 'English' },
				{ value: 'DE', label: 'Deutsch' }
			]} />
	</section>
	<!-- <section class="flex flex-col items-start space-y-2">
		<h2 class="text-secondary-500 dark:text-secondary-300">{$t('settings', 'theme')}</h2>
		<LightSwitch />
	</section> -->
	<section class="flex flex-col items-start space-y-2">
		<h2 class="text-secondary-500 dark:text-secondary-300">{$t('settings', 'accountDeletion')}</h2>
		<p class="dark:text-error-600">
			{$t('settings', 'deletionWarning')}
		</p>
		<button
			onclick={() =>
				modalStore.trigger({
					type: 'confirm',
					title: $t('settings', 'alertTitle'),
					body: $t('settings', 'alertBody'),
					response: async (r) => {
						if (r) {
							console.log('supprimer mon compte');
							let { data, error } = await supabase.from('user_messages').insert({
								titre: 'Kiné Helper : nouvelle demande de Suppression du compte',
								message: `from <${appState.user.nom + ' ' + appState.user.prenom}> ${
									appState.user.email
								} : \n Merci de supprimer mes données de votre serveur`,
								user_id: appState.user.id
							});
							console.log('data', data);
							console.log('error', error);

							await nukeUsersData();
						}
					}
				})}
			class="variant-outline-error btn btn-sm">{$t('settings', 'deletionConfirm')}</button>
	</section>
	<section class="flex flex-col items-start space-y-2">
		<!-- <h2 class="text-secondary-500 dark:text-secondary-300">{$t('settings', 'profile')}</h2> -->
		<PostSignupForm class="w-screen" />
	</section>
</main>
