<script>
	import FormWrapper from '../FormWrapper.svelte';
	import TextField from '../TextField.svelte';
	import SubmitButton from '../SubmitButton.svelte';
	import CheckboxField from '../CheckboxField.svelte';
	import SectionCard from '../SectionCard.svelte';
	import IbanField from './IbanField.svelte';
	import { user } from '$lib/index';
	import { supabase } from '../../stores/supabaseClient';
	import { goto } from '$app/navigation';

	let message = '';

	let formSchema = {
		isValid: isValid
	};

	async function isValid({ formData, submitter }) {
		console.log('in isValid with', formData);
		submitter.innerHTML = 'Envoi des données...';
		formData.conventionne ??= false;
		let { data, error } = await supabase
			.from('kinesitherapeute')
			.upsert(formData)
			.select();
		submitter.innerHTML = 'OK';
		$user.profil = data[0];
		console.log(data, error);
		console.log($user);
		if (error) {
			message = error.message
			throw new Error(error);
		}
		goto('/dashboard');
	}
	async function test() {
		formError('Voilà bon ça a merdé', "<div class=\"text-3xl text-primary-500\“><b>Clairement</b> on en est pas fièr</div>")
	}
</script>

<button on:click={test} class="btn variant-outline-primary">TEST</button>
<FormWrapper {formSchema}>
	<span slot="title">Formulaire post-inscription</span>
	<p class="m-8 text-surface-600">
		Ces informations sont nécessaires pour certaines fonctionnalités de Kiné Helper. Elles ne seront
		jamais partagées avec qui que ce soit.
	</p>
	<div class="flex flex-col md:flex-row">
		<div class="w-full p-2 md:w-1/3 md:p-4 lg:p-8">
			<SectionCard>
				<input type="hidden" name="id" value={$user.user.id} />
				<TextField
					name="nom"
					value={$user.profil?.nom ?? undefined}
					required
					label="nom"
					placeholder="nom" />
				<TextField
					name="prenom"
					value={$user.profil?.prenom ?? undefined}
					required
					label="prenom"
					placeholder="prenom" />
				<TextField
					name="adresse"
					value={$user.profil?.adresse ?? undefined}
					required
					placeholder="Rue et numéro"
					label="Rue et numéro" />
				<TextField
					name="cp"
					value={$user.profil?.cp ?? undefined}
					type="number"
					pattern={/^[0-9]{4}$/}
					patternMessage="Le code postal est invalide"
					required
					placeholder="Code postal"
					label="Code postal" />
				<TextField
					name="localite"
					value={$user.profil?.localite ?? undefined}
					required
					placeholder="Localité"
					label="Localité" />
				<TextField
					name="gsm"
					value={$user.profil?.gsm ?? undefined}
					placeholder="N° de gsm"
					label="N° de gsm" />
			</SectionCard>
		</div>
		<div class="w-full p-2 md:w-1/3 md:p-4 lg:p-8">
			<SectionCard>
				<TextField
					name="inami"
					value={$user.profil?.inami ?? undefined}
					required
					pattern={/^\d{11}$/}
					patternMessage="Doit comporter 11 chiffres sans espaces ni slash (/)"
					label="INAMI"
					placeholder="N° INAMI" />
				<IbanField value={$user.profil?.iban ?? undefined} />
				<TextField
					name="bce"
					value={$user.profil?.bce ?? undefined}
					required
					pattern={/^\d{10}$/}
					patternMessage="Doit comporter 10 chiffres sans espaces ni slash (/)"
					label="N° Banque Carrefour Entreprise"
					placeholder="N° BCE" />
				<CheckboxField
					name="conventionne"
					value={$user.profil?.conventionne ?? undefined ?? true}
					checked={$user.profil?.conventionne ?? undefined ?? true}
					placeholder="Conventionnement"
					label="Est conventionné" />
			</SectionCard>
			<SubmitButton class="m-4 md:m-8">Envoyer</SubmitButton>
		</div>
	</div>
	<div class="font-semibold">{message}</div>
</FormWrapper>
