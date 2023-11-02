<script>
	import FormWrapper from '../FormWrapper.svelte';
	import TextField from '../TextField.svelte';
	import RadioField from '../RadioField.svelte';
	import InfoIcon from '$lib/ui/svgs/InfoIcon.svelte';
	import SubmitButton from '../SubmitButton.svelte';
	import { getToastStore, popup } from '@skeletonlabs/skeleton';
	import { errorToast } from '$lib/ui/toasts';
	import SelectField from '../SelectField.svelte';
	import SectionCard from '../SectionCard.svelte';
	import CheckboxField from '../CheckboxField.svelte';
	import CheckboxesSetField from '../CheckboxesSetField.svelte';

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
	export let situation_pathologique;

	let groupOptions = [
		{ label: 'Pathologies Courantes', value: 0 },
		{ label: 'Pathologies Lourdes', value: 1 },
		{ label: 'Pathologies à 2 séances par jour', value: 2 },
		{ label: 'Grossesse et Post-Partum', value: 3 },
		{ label: 'Liste Fa', value: 4 },
		{ label: 'Liste Fb', value: 5 },
		{ label: 'Patients Palliatifs à domicile', value: 6 },
		{ label: 'Hôpital de jour non concernés par ces dispositions', value: 7 },
		{ label: 'Indemnités de déplacement par groupe', value: 8 },
		{ label: 'Forfait genou/hanche par application mobile', value: 9 }
	];
	let lieuOptions = [
		{ label: '1a) Cabinet hors hopital', value: 0 },
		{ label: '1b) Cabinet dans hopital', value: 1 },
		{ label: '1c) Cabinet dans service médicalisé', value: 2 },
		{ label: '2) Domicile', value: 3 },
		{ label: '3a) Résidence communautaire', value: 4 },
		{ label: '3b) Maison de soins psychiatriques', value: 5 },
		{ label: '4) Hopital', value: 6 },
		{ label: '5) Centre de rééducation', value: 7 },
		{ label: '6) Maison de repos', value: 8 }
	];
	let dureeOptions = [
		{ label: '15 minutes', value: 0 },
		{ label: '20 minutes', value: 1 },
		{ label: '30 minutes', value: 2 },
		{ label: '45 minutes', value: 3 },
		{ label: '60 minutes', value: 4 },
		{ label: '120 minutes', value: 5 }
	];
	let day_of_weekOptions = [
		{ id: 'Lu', label: 'Lundi', name: 'day_of_week', value: 1 },
		{ id: 'Ma', label: 'Mardi', name: 'day_of_week', value: 2 },
		{ id: 'Me', label: 'Mercredi', name: 'day_of_week', value: 3 },
		{ id: 'Je', label: 'Jeudi', name: 'day_of_week', value: 4 },
		{ id: 'Ve', label: 'Vendredi', name: 'day_of_week', value: 5 },
		{ id: 'Sa', label: 'Samedi', name: 'day_of_week', value: 6 },
		{ id: 'Di', label: 'Dimanche', name: 'day_of_week', value: 0 }
	];
	const dejaFaitePopUp = {
		event: 'hover',
		target: 'dejaFaitePopUp',
		placement: 'left'
	};
</script>

<FormWrapper {formSchema} class="">
	<!--! Hidden fields  -->
	<input type="hidden" name="sp_id" value={situation_pathologique?.sp_id} />
	<input type="hidden" name="patient_id" value={situation_pathologique?.patient_id} />
	<input type="hidden" name="user_id" value={situation_pathologique?.user_id} />
	<input type="hidden" name="created_at" value={situation_pathologique?.created_at} />
	<div class="flex flex-col md:flex-row">
		<div class="w-full p-2 md:w-1/3 md:p-4 lg:p-8">
			<SectionCard label="Valeurs par défault">
				<!--! DEFAULT fields  -->
				<!--? Les 3 Selects suivant ont une interaction complexe. Il va falloir faire en sorte de les faire s'entrevalider ? ou faire confiance à l'utilisateur ¯\_(ツ)_/¯ -->
				<SelectField
					options={groupOptions}
					required
					name="groupe"
					label="Groupe pathologique"
					placeholder="Choisir un groupe pathologique" />
				<SelectField
					options={dureeOptions}
					required
					name="duree"
					label="Durée par séance"
					placeholder="Choisir une durée" />
				<SelectField
					options={lieuOptions}
					required
					name="lieu"
					label="lieu par séance"
					placeholder="Choisir un lieu" />
				<!--? doit disparaitre si le groupe n'est pas lourde ou Fb -->
				<CheckboxField name="drainage" label="J'effectue un drainage" />
				<div class="flex flex-col rounded-lg border border-surface-500 p-2">
					<TextField name="numero_etablissment" label="Numéro d'établissement" />
					<TextField name="service" label="Service" />
				</div>
			</SectionCard>
		</div>
		<div class="w-full p-2 md:w-1/3 md:p-4 lg:p-8">
			<SectionCard label="Label">
				<div class="flex">
					<TextField
						name="deja_faites"
						parentClass="w-11/12"
						type="number"
						required
						placeholder="Séances déjà effectuées"
						label="Séances déjà effectuées" />
					<div use:popup={dejaFaitePopUp}>
						<InfoIcon class="h-6 w-6" />
						<div data-popup="dejaFaitePopUp">
							<div class="card variant-filled-surface max-w-[250px] p-4">
								<p class="text-sm">
									Ici, vous pourrez indiquer les sessions éventuellement déjà effectuées par un.e
									collègue
								</p>
								<div class="variant-filled-surface arrow" />
							</div>
						</div>
					</div>
				</div>
                <!--! Nan ça va pas ... Il faut mettre les heures en plus -->
				<CheckboxesSetField parentClass="flex-col" labelClass="flex" options={day_of_weekOptions} />
			</SectionCard>
		</div>
	</div>
	<div class="font-semibold">{message}</div>
	<SubmitButton>Envoyer</SubmitButton>
</FormWrapper>

<!--! Séance Génération Fields -->
<!--*  -->
<!--* day_of_week -->
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
