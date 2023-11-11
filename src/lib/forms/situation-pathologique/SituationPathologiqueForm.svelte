<script>
	import {
		FormWrapper,
		// TextField,
		// RadioField,
		// SelectField,
		// SectionCard,
		// CheckboxField,
		SubmitButton,
		// CheckboxesSetField
	} from '../index';
	import InfoIcon from '$lib/ui/svgs/InfoIcon.svelte';
	import { getToastStore, popup } from '@skeletonlabs/skeleton';
	import { errorToast } from '$lib/ui/toasts';
	import { getContext, setContext } from 'svelte';
	// import SeanceGeneratorSectionCard from './sections/seance-generator-section/SeanceGeneratorSectionCard.svelte';
	import SeanceGeneratorSection from './sections/seance-generator-section/SeanceGeneratorSection.svelte';
	import SeanceGeneratorSectionCard from './sections/seance-generator-section/SeanceGeneratorSectionCard.svelte';

	const toastStore = getToastStore();
	let message = '';

	let additionalValidators = {};

	function addValidators(validators) {
		console.log('In add validators with', validators);
		addValidators = { ...addValidators, ...validators };
	}
	setContext('validators', addValidators);

	let formSchema = {
		isValid: isValid,
		validators: {
			password2: {
				fn: () => console.log('example'),
				errorMessage: 'Attention'
			},
			...additionalValidators
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
	export let situation_pathologique = undefined;
</script>

<FormWrapper {formSchema} class="">
	<!--! Hidden fields  -->
	<input type="hidden" name="sp_id" value={situation_pathologique?.sp_id} />
	<input type="hidden" name="patient_id" value={situation_pathologique?.patient_id} />
	<input type="hidden" name="user_id" value={situation_pathologique?.user_id} />
	<input type="hidden" name="created_at" value={situation_pathologique?.created_at} />
	<div class="flex flex-col flex-wrap md:flex-row">
		<div class="w-full md:p-4">
			<SeanceGeneratorSection />
		</div>
		<!-- <div class="w-full p-2 md:w-1/3 md:p-4 lg:p-8">
			<SectionCard label="Valeurs par défault">
				<div class="flex flex-col rounded-lg border border-surface-500 p-2">
					<TextField name="numero_etablissment" label="Numéro d'établissement" />
					<TextField name="service" label="Service" />
				</div>
			</SectionCard>
		</div> -->
	</div>
	<div class="font-semibold">{message}</div>
	<!-- <SubmitButton>Envoyer</SubmitButton> -->
</FormWrapper>

<!--! Séance Génération Fields -->
<!--*  -->
<!--*  -->
<!--* seance_per_week -->

<!--? tout le traitement ou un nombre custom -->
<!--* n_seances -->
<!--? Conditionel Selon les groupes, trigger l'ajout atomatique d'une séance -->
<!--* seconde_autorisee -->
<!--? Conditionel Selon les groupes, trigger l'ajout atomatique d'une séance -->
<!--* consultation_demandee -->
<!-- à ceci doit s'ajouter les codes dossiers, intake et indemnité de dplcmt -->

<!--! Informations légales obligatoires  -->
<!--* motif -->
<!--* plan_du_ttt -->
