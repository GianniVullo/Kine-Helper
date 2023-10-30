<script>
	import FormWrapper from '../FormWrapper.svelte';
	import TextField from '../TextField.svelte';
	import SubmitButton from '../SubmitButton.svelte';
	import CheckboxField from '../CheckboxField.svelte';
	import SectionCard from '../SectionCard.svelte';
	import IbanField from './IbanField.svelte';

	let message = '';

	let formSchema = {
		isValid: isValid,
		// validators: {
		// 	password2: {
		// 		fn: () => console.log('example'),
		// 		errorMessage: 'Attention'
		// 	}
		// }
	};

	async function isValid({ formData, submitter }) {
		console.log('ValidationHere');
	}
</script>

<FormWrapper {formSchema}>
	<span slot="title">
		Post Signup Form
	</span>
	<p class="m-8 text-surface-600">
		Ces informations ne seront jamais partagées avec aucunes tierces parties sans votre permission.
	</p>
	<div class="flex flex-col md:flex-row">
		<div class="w-full p-2 md:w-1/3 md:p-4 lg:p-8">
			<SectionCard>
				<TextField name="nom" required label="nom" placeholder="nom" />
				<TextField name="prenom" required label="prenom" placeholder="prenom" />
				<TextField name="adresse" required placeholder="Rue et numéro" label="Rue et numéro" />
				<TextField
					name="cp"
					type="number"
					pattern={/^[0-9]{4}$/}
					patternMessage="Le code postal est invalide"
					required
					placeholder="Code postal"
					label="Code postal" />
				<TextField name="localite" required placeholder="Localité" label="Localité" />
				<TextField name="gsm" placeholder="N° de gsm" label="N° de gsm" />
			</SectionCard>
		</div>
		<div class="w-full p-2 md:w-1/3 md:p-4 lg:p-8">
			<SectionCard>
				<TextField name="inami" required label="INAMI" placeholder="N° INAMI" />
				<IbanField />
				<TextField
					name="numero_bce"
					required
					label="N° Banque Carrefour Entreprise"
					placeholder="N° BCE" />
				<CheckboxField
					name="conventionne"
					value={true}
					placeholder="Conventionnement"
					label="Est conventionné" />
				<TextField name="conventionne" required label="conventionnement" placeholder="conventionne"
				 />
			</SectionCard>
			<SubmitButton class="m-4 md:m-8">Envoyer</SubmitButton>
		</div>
	</div>
	<div class="font-semibold">{message}</div>
</FormWrapper>
