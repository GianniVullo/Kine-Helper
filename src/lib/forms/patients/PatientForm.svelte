<script>
	import SubmitButton from '../SubmitButton.svelte';
	import TextField from '../TextField.svelte';
	import FormWrapper from '../FormWrapper.svelte';
	import SectionCard from '../SectionCard.svelte';
	import RadioField from '../RadioField.svelte';
	import MutualiteField from './MutualiteField.svelte';
	import CheckboxField from '../CheckboxField.svelte';
	import { supabase } from '../../stores/supabaseClient';
	import { goto } from '$app/navigation';
	import { patients } from '../../stores/PatientStore';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { errorToast } from '$lib/ui/toasts';
	import { user } from '../../stores/UserStore';

	const toastStore = getToastStore();
	let message = '';
	let patient;

	let formSchema = {
		isValid,
		validators: {
			mutualite: {
				fn: function mutualiteValide(value) {
					console.log('in the mutaliteValide with value', value);

					return [
						100, 120, 134, 200, 203, 216, 228, 235, 300, 304, 306, 309, 311, 319, 322, 323, 400,
						403, 407, 409, 411, 417, 500, 509, 515, 526, 600, 600, 675, 602, 603, 604, 605, 606,
						607, 608, 609, 610, 612, 615, 620, 622, 675, 900, 910, 920, 921, 922, 930, 931, 940,
						941, 942
					].includes(parseInt(value));
				},
				errorMessage: 'Veuillez entrer un numéro de mutualité valide'
			}
		}
	};

	async function isValid({ formData, submitter }) {
		console.log('in PatientForm validation', formData);
		// First we add the booleans that might not be present cause of inconsistency of form validation with checkboxes
		formData.tiers_payant ??= false;
		formData.ticket_moderateur ??= false;
		formData.bim ??= false;
		// We encrypt it (Do we tho ?)
		// then we proceed with sending to Supabase
		let data;
		let error;
		if (!patient) {
			let newPatient = await supabase.from('patients').insert(formData).select();
			data = newPatient.data[0];
			error = newPatient.error;
		} else {
			let updatedPatient = await supabase
				.from('patients')
				.update(patient)
				.eq('patient_id', formData.patient_id);
			data = updatedPatient.data;
			error = updatedPatient.error;
		}
		if (error) {
			toastStore.trigger(
				errorToast(
					`<span class="text-error-700 text-lg">Erreur </span> <br>info : "${error}" <span class"text-surface-700"><br> Si l'erreur persiste merci de bien vouloir nous contacter.</span>`
				)
			);
			throw new Error(error);
		}
		if (patient) {
			$patients.find((patient) => patient.patient_id == formData.patient_id);
		} else {
			console.log($patients[0], data);
			patients.set([... $patients, data]);
		}
		// I think it might be counter productive as the button will anyway be destroyed
		// submitter.disabled = false;
		goto(`dashboard/medical-files/patients/${data.patient_id}`);
	}

	function nissToDate(event) {
		console.log(event.target.value);
		let date = event.target.value;
		if (date.length > 5) {
			try {
				// getting the current year
				let todaysYear = new Date(Date.now()).getFullYear();
				let year = date.substring(0, 2);
				let mounth = date.substring(2, 4);
				let day = date.substring(4, 6);
				let rigthYear = '';
				console.log(year, mounth, day);
				// Transforming the year into 2 digits year integer to compare
				// it to the patient birth date
				// this way we have more probability to guess right the century
				rigthYear += `${
					parseInt(year) < parseInt(todaysYear.toString().substring(2, 4)) + 1 ? '20' : '19'
				}${year}-${mounth}-${day}`;
				console.log(rigthYear);
				document.getElementById('date_naissance').value = rigthYear;
			} catch (error) {
				console.log(error);
			}
		}
	}
</script>

<FormWrapper {formSchema}>
	<span slot="title">
		Formulaire patient
	</span>
	{#if patient}
		 <input name="patient_id" type="hidden" />
	{/if}
	<input name="kinesitherapeute_id" type="hidden" value={$user.id} />

	<div class="flex flex-col md:flex-row">
		<!--* Identification -->
		<div class="w-full p-2 md:w-1/3 md:p-4 lg:p-8">
			<SectionCard label="Identification">
				<TextField name="nom" required placeholder="Nom" label="Nom" />
				<TextField name="prenom" required placeholder="Prénom" label="Prénom" />
				<TextField
					name="niss"
					required
					placeholder="Niss"
					label="Niss"
					pattern={/^[0-9]{11}$/}
					patternMessage="Veuillez entrer 11 chiffres sans formatage particulier"
					onChangeHandler={nissToDate} />
				<TextField
					name="date_naissance"
					required
					type="date"
					placeholder="Date de naissance"
					label="Date de naissance" />
				<RadioField
					name="sexe"
					label="Sexe"
					options={[
						{ value: 'M', label: 'Masculin' },
						{ value: 'F', label: 'Féminin' }
					]} />
				<TextField
					name="adresse"
					required
					placeholder="Rue et numéro"
					label="Rue et numéro" />
				<TextField
					name="cp"
					type="number"
					pattern={/^[0-9]{4}$/}
					patternMessage="Le code postal est invalide"
					required
					placeholder="Code postal"
					label="Code postal" />
				<TextField name="localite" required placeholder="Localité" label="Localité" />
			</SectionCard>
		</div>
		<!--* Assurabilité -->
		<div class="w-full p-2 md:w-1/3 md:p-4 lg:p-8">
			<SectionCard label="Assurabilité">
				<MutualiteField />
				<TextField
					name="num_affilie"
					placeholder="N° d'affilié (Optionnel)"
					label="N° d'affilié (Optionnel)" />
				<CheckboxField
					name="tiers_payant"
					value={false}
					placeholder="est tiers payant"
					label="est tiers payant" />
				<CheckboxField
					name="ticket_moderateur"
					value={true}
					checked
					placeholder="est tiers payant"
					label="paye le ticket modérateur" />
				<CheckboxField name="bim" value={false} placeholder="est BIM" label="est BIM" />
				<TextField
					name="numero_etablissment"
					placeholder="N° d'établissement"
					label="N° d'établissement" />
				<TextField name="service" placeholder="Service" label="Service" />
			</SectionCard>
		</div>
		<!--* Contact -->
		<div class="w-full p-2 md:w-1/3 md:p-4 lg:p-8">
			<SectionCard label="Contact">
				<TextField name="tel" placeholder="N° de téléphone" label="N° de téléphone" />
				<TextField name="gsm" placeholder="N° de gsm" label="N° de gsm" />
				<TextField name="email" placeholder="E-mail" type="email" label="E-mail" />
			</SectionCard>
		</div>
	</div>
	<!--? Actif doit être présent uniquement dans UpdateForm => If (patient) {} -->
	<!--! Actif, doit être renomé "archivé" -->
	<!--* doit devenir juste un bouton et ne pas figurer sur le formulaire -->
	<SubmitButton>
		{patient ? 'Mettre à jour' : 'Enregistrer'}
	</SubmitButton>
	{message}
</FormWrapper>
