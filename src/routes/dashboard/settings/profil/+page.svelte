<script>
	import { supabase } from '../../../../lib';
	import Modal from '../../../../lib/cloud/libraries/overlays/Modal.svelte';
	import { toast } from '../../../../lib/cloud/libraries/overlays/notificationUtilities.svelte';
	import SimpleSelect from '../../../../lib/components/forms/fields/SimpleSelect.svelte';
	import { t, locale, dictionnary } from '../../../../lib/i18n';
	import { appState } from '../../../../lib/managers/AppState.svelte';
	import { onKineUpsert } from '../../../../lib/components/forms/onSubmits.svelte';
	import { Formulaire } from '../../../../lib/cloud/libraries/formHandler.svelte';
	import KineForm from '../../../../lib/components/forms/KineForm.svelte';
	import { SubmitButton, FormSection, Field } from '../../../../lib/components/forms/blocks';
	import { errorIcon } from '../../../../lib/ui/svgs/IconSnippets.svelte';
	import BoutonPrincipal from '../../../../lib/components/BoutonPrincipal.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { openModal } from '../../../../lib/cloud/libraries/overlays/modalUtilities.svelte';
	import {
		lazy,
		object,
		pipe,
		regex,
		transform,
		boolean,
		digits,
		length,
		union,
		string,
		uuid
	} from 'valibot';
	import {
		kineInamiValidator,
		stringLengthMoreThan1
	} from '../../../../lib/components/forms/validators/baseValidators';
	import { get } from 'svelte/store';
	import DarkModeSwitch from '../../../../lib/cloud/libraries/DarkModeSwitch.svelte';
	import { info } from '../../../../lib/cloud/libraries/logging';

	let { data } = $props();

	let cpVal = (x) => pipe(stringLengthMoreThan1(), digits(), x);

	let confirmDeletionText = $state('');
	const validateurs = {
		id: pipe(string(), uuid()),
		nom: stringLengthMoreThan1(),
		prenom: stringLengthMoreThan1(),
		adresse: stringLengthMoreThan1(),
		cp: pipe(
			transform((input) => {
				if (typeof input === 'number') {
					return input.toString();
				}
				return input;
			}),
			union([cpVal(length(4)), cpVal(length(5))], get(t)('form.postSignup', 'validation.postCode')),
			transform((input) => parseInt(input))
		),
		localite: stringLengthMoreThan1(),
		// gsm: stringLengthMoreThan1ButCanBeNull,
		inami: kineInamiValidator(),
		iban: pipe(
			stringLengthMoreThan1(),
			transform((input) => {
				input = input.replaceAll(' ', '');
				input = input.toUpperCase();
				let newInput = '';

				for (let idx = 0; idx < input.length; idx++) {
					const element = input[idx];
					if ([4, 8, 12].includes(idx)) {
						newInput += ' ';
					}
					newInput += element;
				}
				return newInput;
			}),
			regex(
				/\b[A-Z]{2}[0-9]{2}(?:[ ]?[0-9]{4}){4}(?:[ ]?[0-9]{0,2})?$\b|\bBE[0-9]{2}(?:[ ]?[0-9]{4}){3}\b/,
				'Veuillez entrer un IBAN valide.'
			)
		),
		bce: pipe(stringLengthMoreThan1(), length(10, get(t)('form.postSignup', 'validation.bce'))),
		conventionne: boolean()
	};

	let formHandler = new Formulaire({
		schema: lazy(() =>
			pipe(
				object(validateurs),
				transform((input) => {
					if (typeof input.cp === 'string') {
						input.cp = parseInt(input.cp, 10);
					}
					if (typeof input.conventionne === 'string') {
						input.conventionne = JSON.parse(input.conventionne);
					}
					return input;
				})
			)
		),
		validateurs,
		initialValues: {
			...appState.user,
			id: appState.user?.id,
			conventionne: appState.user?.conventionne ?? false
		},
		onValid: onKineUpsert,
		submiter: '#user-data-button',
		formElement: '#user-data-form'
		// delaySetup: true
	});

	async function setLangAsDefault(lang) {
		info('Setting language as default:', lang);
		await appState.db.execute('UPDATE translations SET is_default = $1', [false]);
		await appState.db.execute('UPDATE translations SET is_default = $1 WHERE code = $2', [
			true,
			lang
		]);
	}

	async function changingLanguage(event) {
		const lang = event.target.value;
		info('Changing language to', lang);
		if (lang === $locale) return;
		// d'abord on cherche si le dictionnaire se trouve déjà dans le cache
		let remoteVersion;
		if ($dictionnary[lang]) {
			// On vérifie la version avec le serveur
			const { data: versionList } = await supabase
				.from('translations')
				.select('version')
				.eq('code', lang);
			remoteVersion = versionList[0].version;
			info('Version on the server :', versionList);
			// Si le dictionnaire est à jour, on fait rien
			if ($dictionnary[lang].version) {
				if (versionList[0].version === $dictionnary[lang].version) {
					locale.set(lang);
					await setLangAsDefault(lang);
					// On recharge la page pour appliquer le changement de langue
					goto('/dashboard/settings/profil');
					return;
				}
			}
		}
		// On verifie si la version sélectionnée n'est pas déjà en local
		const { data: localVersion } = await appState.db.select(
			'SELECT * FROM translations WHERE code = $1',
			[lang]
		);
		info('Local version:', localVersion?.[0]?.version);
		const foundLocale = localVersion.length > 0;
		if (foundLocale && localVersion?.[0]?.version === remoteVersion) {
			info('Using local version of the dictionary');
			locale.set(lang);
			await setLangAsDefault(lang);
			dictionnary.update((d) => {
				console.log('Updating local dictionnary with local version', localVersion[0].translation);
				d[lang] = JSON.parse(localVersion[0].translation);
				return d;
			});
			// On recharge la page pour appliquer le changement de langue
			goto('/dashboard/settings/profil');
			return;
		}
		// si le dictionnaire n'est pas dans le cache ou n'a pas la même version, on le télécharge directement
		const { data } = await supabase.from('translations').select().eq('code', lang);
		// On met à jour le dictionnaire
		dictionnary.update((d) => {
			d[lang] = data[0].translation;
			return d;
		});
		// On sauve dans la db locale
		if (foundLocale) {
			info('Updating local version of the dictionary');
			await appState.db.execute(
				'UPDATE translations SET translation = $1, version = $2 WHERE code = $3',
				[data[0].translation, data[0].version, lang]
			);
		} else {
			info('Inserting new local version of the dictionary');
			await appState.db.execute(
				'INSERT INTO translations (id, created_at, code, translation, version) VALUES ($1, $2, $3, $4, $5)',
				[data[0].id, data[0].created_at, lang, data[0].translation, data[0].version]
			);
		}
		locale.set(lang);
		await setLangAsDefault(lang);
	}
	const btnBaseCSS =
		'inline-flex w-full justify-center rounded-md  px-3 py-2 text-sm font-semibold text-white shadow-xs  sm:w-auto';
</script>

<main class="flex h-full w-full grid-cols-6 flex-col gap-y-10 overflow-y-scroll">
	<FormSection
		titre={$t('settings', 'lang')}
		description="Vous pouvez choisir entre le français, le néerlandais, l'allemand ou l'anglais">
		<div class="col-span-full">
			<SimpleSelect
				onchange={async (e) => {
					// info('Changing language to', e.target.value);
					await changingLanguage(e);
				}}
				value={$locale}
				name="lang"
				options={[
					{ value: 'FR', label: 'Français' },
					{ value: 'NL', label: 'Nederlands' },
					{ value: 'EN', label: 'English' },
					{ value: 'DE', label: 'Deutsch' }
				]} />
		</div>
	</FormSection>

	<section class="flex flex-col items-start space-y-2">
		<!-- <h2 class="text-secondary-500 dark:text-secondary-300">{$t('settings', 'profile')}</h2> -->
		<KineForm bind:formHandler />
		<SubmitButton
			id="user-data-button"
			disabled={!formHandler.isDirty}
			loading={formHandler.loading} />
	</section>
	<FormSection
		titre={$t('settings', 'accountDeletion')}
		description="Attention, la loi requiert que vous conserviez les données de vos patients pour une durée de 10 ans. Si vous souhaitez mettre fin à votre contrat avec nous, nous vous remettrons vos données avant de les supprimer définitivement de nos serveurs.">
		<div class="col-span-full">
			<BoutonPrincipal
				color="error"
				onclick={() => openModal({ name: 'deleteAccount' })}
				inner={$t('settings', 'deletionConfirm')} />
		</div>
	</FormSection>
</main>

<Modal
	opened={page.state?.modal?.name === 'deleteAccount'}
	title={$t('settings', 'alertTitle')}
	body={$t('settings', 'alertBody')}>
	<form
		class="mt-10"
		onsubmit={async (event) => {
			event.preventDefault();
			if (confirmDeletionText === 'Delete my account') {
				let { data, error } = await supabase.from('user_messages').insert({
					titre: 'Kiné Helper : nouvelle demande de Suppression du compte',
					message: `from <${appState.user.nom + ' ' + appState.user.prenom}> ${
						appState.user.email
					} : \n Merci de supprimer mes données de votre serveur`,
					user_id: appState.user.id
				});
				console.log('supprimer mon compte');
				// await nukeUsersData();
			} else {
				if (!toast.fired.some((toast) => toast.titre === 'Erreur!')) {
					toast.trigger({
						titre: 'Erreur!',
						description: 'Le texte saisi ne correspond pas à "Delete my account".',
						leading: errorIcon,
						leadingCSS: 'size-6 text-red-400',
						timeout: 5000
					});
				}
			}
		}}>
		<div class="flex flex-col items-start space-y-2">
			<label for="confirmation" class="text-surface-600 dark:text-surface-300">
				{$t('settings', 'confirmDeletion')}
			</label>
			<Field
				bind:value={confirmDeletionText}
				field={{
					name: 'confirmation',
					type: 'text',
					titre: 'Confirmation',
					help: 'Écrivez "Delete my account" pour confirmer la suppression de votre compte',
					placeholder: 'Delete my account',
					required: true,
					class: 'input'
				}} />
			<BoutonPrincipal
				inner="Supprimer mon compte"
				id="user-data-button"
				disabled={!confirmDeletionText || confirmDeletionText !== 'Delete my account'}
				color="error" />
			<!-- <button
				type="submit"
				disabled={confirmDeletionText !== 'Delete my account'}
				class={[btnBaseCSS, 'bg-red-600 hover:bg-red-500']}>Supprimer mon compte</button> -->
		</div>
	</form>
</Modal>
