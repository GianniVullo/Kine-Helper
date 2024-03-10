<script>
	import { FormWrapper, TextField, SubmitButton, CheckboxField, SectionCard } from '../index';
	import IbanField from './IbanField.svelte';
	import { user } from '$lib/index';
	import { supabase } from '../../stores/supabaseClient';
	import { goto } from '$app/navigation';
	import DBAdapter from '../actions/dbAdapter';
	import dayjs from 'dayjs';
	import { t } from '../../i18n';
	import { get } from 'svelte/store';

	let message = '';
	let clazz = '';
	export { clazz as class };
	export let column = false;
	let formSchema = {
		isValid: isValid
	};

	async function isValid({ formData, submitter }) {
		console.log('in isValid with', formData);
		submitter.innerHTML = get(t)('shared', 'loading');
		formData.conventionne ??= false;
		let dict = {
			nom: formData.nom,
			prenom: formData.prenom,
			email: $user.user.email,
			id: $user.user.id
		};
		let { data, error } = await supabase.from('kinesitherapeutes').upsert(dict);
		submitter.innerHTML = 'OK';
		console.log(data, error);
		user.update((u) => {
			u.profil = {
				nom: formData.nom,
				prenom: formData.prenom,
				inami: formData.inami,
				bce: formData.bce,
				iban: formData.iban,
				adresse: formData.adresse,
				cp: formData.cp,
				localite: formData.localite,
				conventionne: formData.conventionne
			};
			return u;
		});
		if (error) {
			message = error.message;
			throw new Error(error);
		}
		// si il n'y a pas d'objet settings ou que l'objet settings ne contient pas de raw printer alors on redirige vers la page de configuration
		let db = new DBAdapter();
		try {
			await db.save('kines', {
				user_id: $user.user.id,
				nom: formData.nom,
				prenom: formData.prenom,
				inami: formData.inami,
				bce: formData.bce,
				iban: formData.iban,
				adresse: formData.adresse,
				cp: formData.cp,
				localite: formData.localite,
				conventionne: formData.conventionne
			});
		} catch (error) {
			await db.update('kines', [['user_id', $user.user.id]], {
				nom: formData.nom,
				prenom: formData.prenom,
				inami: formData.inami,
				bce: formData.bce,
				iban: formData.iban,
				adresse: formData.adresse,
				cp: formData.cp,
				localite: formData.localite,
				conventionne: formData.conventionne
			});
		}
		let userSettings = await db.retrieve('settings', '*', ['user_id', $user.user.id]);
		console.log('userSettings', userSettings);
		if (userSettings.data.length > 0) {
			user.update((u) => {
				u.settings = userSettings.data[0];
				return u;
			});
			userSettings.data[0].raw_printer
				? goto('/dashboard')
				: goto('/post-signup-forms/printer-setup');
		} else {
			await db.save('settings', {
				user_id: $user.user.id,
				created_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
			});
			user.update((u) => {
				u.settings = { raw_printer: null };
				return u;
			});
			goto('/post-signup-forms/printer-setup');
		}
	}
</script>

<FormWrapper class={'group/form flex flex-col space-y-2 px-4' + clazz} {formSchema}>
	<h1 class="text-surface-600">{$t('form.postSignup', 'title')}</h1>
	<p class="text-surface-500 dark:text-surface-400">
		{$t('form.postSignup', 'description')}
	</p>
	<div class:md:flex-row={!column} class="flex flex-col">
		<div class="w-full p-2 md:p-4 lg:p-8">
			<SectionCard>
				<input type="hidden" name="id" value={$user.user.id} />
				<TextField
					name="nom"
					value={$user.profil?.nom ?? undefined}
					required
					label={$t('shared', 'name')}
					placeholder={$t('shared', 'name')} />
				<TextField
					name="prenom"
					value={$user.profil?.prenom ?? undefined}
					required
					label={$t('shared', 'surname')}
					placeholder={$t('shared', 'surname')} />
				<TextField
					name="adresse"
					value={$user.profil?.adresse ?? undefined}
					required
					placeholder={$t('shared', 'address')}
					label={$t('shared', 'address')} />
				<TextField
					name="cp"
					value={$user.profil?.cp ?? undefined}
					type="number"
					pattern={/^[0-9]{4}$/}
					patternMessage={$t('form.postSignup', 'validation.postCode')}
					required
					placeholder={$t('form.postSignup', 'label.postCode')}
					label={$t('form.postSignup', 'label.postCode')} />
				<TextField
					name="localite"
					value={$user.profil?.localite ?? undefined}
					required
					placeholder={$t('form.postSignup', 'label.city')}
					label={$t('form.postSignup', 'label.city')} />
				<TextField
					name="gsm"
					value={$user.profil?.gsm ?? undefined}
					placeholder={$t('form.postSignup', 'label.cellPhone')}
					label={$t('form.postSignup', 'label.cellPhone')} />
			</SectionCard>
		</div>
		<div class="w-full p-2 md:p-4 lg:p-8">
			<SectionCard>
				<TextField
					name="inami"
					value={$user.profil?.inami ?? undefined}
					required
					pattern={/^\d{11}$/}
					patternMessage={$t('form.postSignup', 'validation.inami')}
					label="INAMI"
					placeholder="INAMI" />
				<IbanField value={$user.profil?.iban ?? undefined} />
				<TextField
					name="bce"
					value={$user.profil?.bce ?? undefined}
					required
					pattern={/^\d{10}$/}
					patternMessage={$t('form.postSignup', 'validation.bce')}
					label={$t('form.postSignup', 'label.bce')}
					placeholder={$t('form.postSignup', 'label.bce')} />
				<CheckboxField
					name="conventionne"
					value={$user.profil?.conventionne ?? undefined ?? true}
					checked={$user.profil?.conventionne ?? undefined ?? true}
					label={$t('form.postSignup', 'label.convention')} />
			</SectionCard>
			<SubmitButton class="m-4 md:m-8" />
		</div>
	</div>
	<div class="font-semibold">{message}</div>
</FormWrapper>
