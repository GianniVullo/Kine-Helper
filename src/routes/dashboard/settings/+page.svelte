<script>
	import { LightSwitch, getModalStore } from '@skeletonlabs/skeleton';
	import SelectFieldV2 from '../../../lib/forms/abstract-fields/SelectFieldV2.svelte';
	import { user } from '../../../lib/stores/UserStore';
	import { get, writable } from 'svelte/store';
	import { t, locale, dictionnary } from '../../../lib/i18n';
	import { supabase } from '../../../lib';
	import { readTextFile, remove, writeTextFile } from '@tauri-apps/plugin-fs';
	import { appLocalDataDir } from '@tauri-apps/api/path';
	import { goto } from '$app/navigation';
	import DBAdapter from '../../../lib/forms/actions/dbAdapter';
	import { patients } from '../../../lib/stores/PatientStore';
	import PostSignupForm from '../../../lib/forms/authentication/PostSignupForm.svelte';
	import RadioFieldV2 from '../../../lib/forms/abstract-fields/RadioFieldV2.svelte';
	import { platform } from '@tauri-apps/plugin-os';
	import WindowsSelectionField from '../../../lib/forms/settings/WindowsSelectionField.svelte';

	const modalStore = getModalStore();
	console.log('user', get(user));
	let imprimanteMatricielle = get(user).settings.raw_printer;
	let is_nine_pin = get(user).settings.is_nine_pin ?? true;
	async function changingLanguage(event) {
		const lang = event.target.value;
		if (lang === $locale) return;
		console.log('changing language to', lang);
		// d'abord on cherche si le dictionnaire se trouve déjà dans le cache
		if ($dictionnary[lang]) {
			console.log('dictionnary already in cache', $dictionnary[lang]);
			// On vérifie la version avec le serveur
			const { data } = await supabase.from('translations').select('version').eq('code', lang);
			//Si le dictionnaire n'a pas de version, on le télécharge directement
			if ($dictionnary[lang].version) {
				if (data[0].version === $dictionnary[lang].version) {
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
		let db = new DBAdapter();
		await db.list('patients', [['kinesitherapeute_id', $user.user.id]], {
			selectStatement: 'patient_id'
		});
		patients.set([]);
		let path = await appLocalDataDir();
		try {
			await remove(`${path}/settings.json`);
		} catch (error) {
			console.log('error', error);
		}
		try {
			await remove(`${path}/${$user.user.id}`, { recursive: true });
		} catch (error) {
			console.log('error', error);
		}
		await supabase.auth.signOut();
		goto('/merci');
	}

	async function changePrinter() {
		console.log($user);
		if (get(user).settings.raw_printer === imprimanteMatricielle) return;
		let db = new DBAdapter();
		await db.update('settings', [['user_id', $user.user.id]], {
			raw_printer: imprimanteMatricielle
		});
		user.update((u) => {
			u.settings.raw_printer = imprimanteMatricielle;
			return u;
		});
		modified.set(false);
	}
	let modified = writable(false);
</script>

<main class="flex h-full w-full flex-col items-start space-y-4 overflow-y-scroll">
	<div>
		<h1 class="text-lg text-surface-600 dark:text-surface-300">{$t('sidebar', 'settings')}</h1>
		<p class="text-surface-400">{$t('settings', 'description')}</p>
	</div>
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
				on:input={() => modified.set(true)}
				bind:value={imprimanteMatricielle} />
		{/if}
		{#if $modified}
			<button on:click={changePrinter} class="variant-outline-primary btn btn-sm"
				>{$t('shared', 'save')}</button>
		{/if}

		<RadioFieldV2
			name="is_nine_pin"
			value={true}
			inline
			label={$t('printerSetup', 'pins.label')}
			options={[
				{ value: true, label: '9' },
				{ value: false, label: '12/24' }
			]} />
	</section>
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
	<section class="flex flex-col items-start space-y-2">
		<h2 class="text-secondary-500 dark:text-secondary-300">{$t('settings', 'theme')}</h2>
		<LightSwitch />
	</section>
	<section class="flex flex-col items-start space-y-2">
		<h2 class="text-secondary-500 dark:text-secondary-300">{$t('settings', 'accountDeletion')}</h2>
		<p class="dark:text-error-600">
			{$t('settings', 'deletionWarning')}
		</p>
		<button
			on:click={() =>
				modalStore.trigger({
					type: 'confirm',
					title: $t('settings', 'alertTitle'),
					body: $t('settings', 'alertBody'),
					response: async (r) => {
						if (r) {
							console.log('supprimer mon compte');
							let { data, error } = await supabase.from('user_messages').insert({
								titre: 'Kiné Helper : nouvelle demande de Suppression du compte',
								message: `from <${get(user).profil.nom + ' ' + get(user).profil.prenom}> ${
									get(user).user.email
								} : \n Merci de supprimer mes données de votre serveur`,
								user_id: $user.user.id
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
