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
	export let patient;
	console.log(patient);

	let formSchema = {
		isValid,
		validators: {
			mutualite: {
				fn: function mutualiteValide(value) {
					console.log('in the mutaliteValide with value', value);

					return [
						100, 120, 128, 134, 200, 203, 216, 228, 235, 300, 304, 306, 309, 311, 319, 322, 323,
						400, 403, 407, 409, 411, 417, 500, 509, 515, 526, 600, 600, 675, 602, 603, 604, 605,
						606, 607, 608, 609, 610, 612, 615, 620, 622, 675, 900, 910, 920, 921, 922, 930, 931,
						940, 941, 942
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
				.update(formData)
				.eq('patient_id', formData.patient_id)
				.select();
			data = updatedPatient.data[0];
			error = updatedPatient.error;
			console.log('In update PatientForm with supabase response = ', data, error);
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
			patients.update((patients) => {
				patients.splice(
					patients.findIndex((patient) => patient.patient_id == data.patient_id),
					1
				);
				patients.push(data);
				return patients
			});
			patients.sortPatient()
			goto(`/dashboard/medical-files/patients/${data.patient_id}`);
		} else {
			console.log($patients[0], data);
			patients.set([...$patients, data]);
			goto(`/dashboard/medical-files/patients/${data.patient_id}`);
		}
		// I think it might be counter productive as the button will anyway be destroyed
		// submitter.disabled = false;
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
	{#if patient}
		<input name="patient_id" type="hidden" value={patient.patient_id} />
	{/if}
	<input name="kinesitherapeute_id" type="hidden" value={$user.user.id} />

	<div class="flex flex-col md:flex-row">
		<!--* Identification -->
		<div class="w-full p-2 md:w-1/3 md:p-4 lg:p-8">
			<SectionCard label="Identification">
				<TextField name="nom" value={patient?.nom} required placeholder="Nom" label="Nom" />
				<TextField
					name="prenom"
					value={patient?.prenom}
					required
					placeholder="Prénom"
					label="Prénom" />
				<TextField
					name="niss"
					value={patient?.niss}
					required
					placeholder="Niss"
					label="Niss"
					pattern={/^[0-9]{11}$/}
					patternMessage="Veuillez entrer 11 chiffres sans formatage particulier"
					onChangeHandler={nissToDate} />
				<TextField
					name="date_naissance"
					value={patient?.date_naissance}
					required
					type="date"
					placeholder="Date de naissance"
					label="Date de naissance" />
				<RadioField
					name="sexe"
					value={patient?.sexe}
					label="Sexe"
					options={[
						{ value: 'M', label: 'Masculin', checked: patient?.sexe === 'M' },
						{ value: 'F', label: 'Féminin', checked: patient?.sexe === 'F' }
					]} />
				<TextField
					name="adresse"
					value={patient?.adresse}
					required
					placeholder="Rue et numéro"
					label="Rue et numéro" />
				<TextField
					name="cp"
					value={patient?.cp}
					type="number"
					pattern={/^[0-9]{4}$/}
					patternMessage="Le code postal est invalide"
					required
					placeholder="Code postal"
					label="Code postal" />
				<TextField
					name="localite"
					value={patient?.localite}
					required
					placeholder="Localité"
					label="Localité" />
			</SectionCard>
		</div>
		<!--* Assurabilité -->
		<div class="w-full p-2 md:w-1/3 md:p-4 lg:p-8">
			<SectionCard label="Assurabilité">
				<MutualiteField query={patient?.mutualite} />
				<TextField
					name="num_affilie"
					value={patient?.num_affilie}
					placeholder="N° d'affilié (Optionnel)"
					label="N° d'affilié (Optionnel)" />
				<CheckboxField
					name="tiers_payant"
					value={patient?.tiers_payant ?? false}
					checked={patient?.tiers_payant}
					placeholder="est tiers payant"
					label="est tiers payant" />
				<CheckboxField
					name="ticket_moderateur"
					value={patient?.ticket_moderateur ?? true}
					checked={patient?.ticket_moderateur}
					placeholder="est tiers payant"
					label="paye le ticket modérateur" />
				<CheckboxField
					name="bim"
					value={patient?.bim ?? false}
					checked={patient?.bim}
					placeholder="est BIM"
					label="est BIM" />
				<TextField
					name="numero_etablissment"
					value={patient?.numero_etablissment}
					placeholder="N° d'établissement"
					label="N° d'établissement" />
				<TextField name="service" value={patient?.service} placeholder="Service" label="Service" />
			</SectionCard>
		</div>
		<!--* Contact -->
		<div class="w-full p-2 md:w-1/3 md:p-4 lg:p-8">
			<SectionCard label="Contact">
				<TextField
					name="tel"
					value={patient?.tel}
					placeholder="N° de téléphone"
					label="N° de téléphone" />
				<TextField name="gsm" value={patient?.gsm} placeholder="N° de gsm" label="N° de gsm" />
				<TextField
					name="email"
					value={patient?.email}
					placeholder="E-mail"
					type="email"
					label="E-mail" />
			</SectionCard>
			<SubmitButton class="mt-4">
				{patient ? 'Mettre à jour' : 'Enregistrer'}
			</SubmitButton>
		</div>
	</div>
	<!--? Actif doit être présent uniquement dans UpdateForm => If (patient) {} -->
	<!--! Actif, doit être renomé "archivé" -->
	<!--* doit devenir juste un bouton et ne pas figurer sur le formulaire -->
	{message}
</FormWrapper>
