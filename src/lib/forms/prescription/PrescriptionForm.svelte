<script>
	import { FormWrapper, NumberField, DateField, SubmitButton } from '../index';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { errorToast } from '$lib/ui/toasts';

	export let date;
	export let jointeAlAttestationDu;
	export let nombre_seance;
	export let seance_par_semaine;

	const toastStore = getToastStore();
	let message = '';

	let formSchema = {
		isValid: isValid,
		validators: {
			password2: {
				fn: () => console.log('example'),
				errorMessage: 'Attention'
			}
		}
	};

	async function isValid({ formData, submitter }) {
		console.log('in IsValid with', formData);
		// if Error
		// toastStore.trigger(
		// 		errorToast(
		// 			`<span class="text-error-700 text-lg">Erreur </span> <br>info : "${error}"`
		// 		)
		// 	);
		// 	throw new Error(error);
	}
</script>

<FormWrapper {formSchema}>
	<input type="hidden" name="prescription_id" />
	<input type="hidden" name="patient_id" />
	<DateField label="Date de la prescription" bind:value={date} name="date" />
	<NumberField bind:value={nombre_seance} name="nombre_seance" />
	<NumberField bind:value={seance_par_semaine} name="seance_par_semaine" />
	<DateField
		label="Date de l'attestation à laquelle la prescription est jointe"
		bind:value={jointeAlAttestationDu}
		name="jointeAlAttestationDu" />
	<p>
		Ce champs est nécessaire uniquement si vous n'êtes pas en possession de la prescription car elle
		a été envoyée à une mutuelle par un autre kiné.
	</p>

	<div class="font-semibold">{message}</div>
	<SubmitButton>Envoyer</SubmitButton>
</FormWrapper>
