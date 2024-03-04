<script>
	import MutualiteField from './MutualiteField.svelte';
	import { goto } from '$app/navigation';
	import { patients, Patient } from '../../stores/PatientStore';
	import { get } from 'svelte/store';
	import { user } from '../../stores/UserStore';
	import {
		SubmitButton,
		TextFieldV2,
		FormWrapper,
		SectionCard,
		RadioFieldV2,
		CheckboxFieldV2
	} from '../index';
	import dayjs from 'dayjs';
	import DBAdapter from '../actions/dbAdapter';
	import DateField from '../abstract-fields/DateField.svelte';
	import NumberField from '../abstract-fields/NumberField.svelte';
	import { tick } from 'svelte';
	import { t } from '../../i18n';

	let message = '';
	export let patient = undefined;

	let patient_id = patient?.patient_id ?? crypto.randomUUID();
	let nom = patient?.nom;
	let prenom = patient?.prenom;
	let niss = patient?.niss;
	let date_naissance = patient?.date_naissance;
	let sexe = patient?.sexe;
	let adresse = patient?.adresse;
	let cp = patient?.cp;
	let localite = patient?.localite;
	let num_affilie = patient?.num_affilie;
	let tiers_payant = patient?.tiers_payant ?? false;
	let ticket_moderateur = patient?.ticket_moderateur ?? true;
	let bim = patient?.bim ?? false;
	let mutualite = patient?.mutualite;
	let numero_etablissement = patient?.numero_etablissement;
	let service = patient?.service;
	let tel = patient?.tel;
	let gsm = patient?.gsm;
	let email = patient?.email;

	let formSchema = {
		isValid,
		validators: {
			mutualite: {
				fn: function mutualiteValide(value) {
					return [
						100, 120, 128, 134, 200, 203, 216, 228, 235, 300, 304, 306, 309, 311, 319, 322, 323,
						400, 403, 407, 409, 411, 417, 500, 509, 515, 526, 600, 600, 675, 602, 603, 604, 605,
						606, 607, 608, 609, 610, 612, 615, 620, 622, 675, 900, 910, 920, 921, 922, 930, 931,
						940, 941, 942
					].includes(parseInt(value));
				},
				errorMessage: $t('form.patient', 'validation.mutualite')
			}
		}
	};

	async function isValid({ formData, submitter }) {
		let data;
		let db = new DBAdapter();
		// <!--* CREATE PROCEDURE -->
		if (!patient) {
			let newPatientObj = {
				kinesitherapeute_id: get(user).user.id,
				patient_id,
				created_at: dayjs().format('YYYY-MM-DD'),
				nom,
				prenom,
				niss,
				date_naissance,
				sexe,
				adresse,
				cp,
				localite,
				num_affilie,
				tiers_payant,
				ticket_moderateur,
				bim,
				mutualite,
				numero_etablissement,
				service,
				tel,
				gsm,
				email
			};
			let newPatient = await db.save('patients', newPatientObj);
			data = new Patient(newPatient.data[0]);
			patients.update((ps) => {
				ps.push(data);
				return ps;
			});
		} else {
			// <!--* UPDATE PROCEDURE -->
			let updatedPatient = {
				nom,
				prenom,
				niss,
				date_naissance,
				sexe,
				adresse,
				cp,
				localite,
				num_affilie,
				tiers_payant,
				ticket_moderateur,
				bim,
				mutualite,
				numero_etablissement,
				service,
				tel,
				gsm,
				email
			};
			await db.update('patients', [['patient_id', patient.patient_id]], updatedPatient);
			patients.update((ps) => {
				let rpatient = ps.find((p) => p.patient_id === patient.patient_id);
				rpatient.nom = nom;
				rpatient.prenom = prenom;
				rpatient.niss = niss;
				rpatient.date_naissance = date_naissance;
				rpatient.sexe = sexe;
				rpatient.adresse = adresse;
				rpatient.cp = cp;
				rpatient.localite = localite;
				rpatient.num_affilie = num_affilie;
				rpatient.tiers_payant = tiers_payant;
				rpatient.ticket_moderateur = ticket_moderateur;
				rpatient.bim = bim;
				rpatient.mutualite = mutualite;
				rpatient.numero_etablissement = numero_etablissement;
				rpatient.service = service;
				rpatient.tel = tel;
				rpatient.gsm = gsm;
				rpatient.email = email;
				return ps;
			});
		}
		patients.sortPatient();
		await tick();
		goto(`/dashboard/patients/${patient?.patient_id ?? data.patient_id}`);
		// I think it might be counter productive as the button will anyway be destroyed
		submitter.disabled = false;
	}
	$: {
		let date = niss ?? '';
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
				date_naissance = rigthYear;
			} catch (error) {
				console.log(error);
			}
		}
	}
</script>

<FormWrapper {formSchema}>
	<div class="flex flex-col md:flex-row">
		<!--* Identification -->
		<div class="w-full p-2 md:w-1/3 md:p-4 lg:p-8">
			<SectionCard label={$t('form.patient', 'cardLabel.id')}>
				<TextFieldV2
					name="nom"
					bind:value={nom}
					required
					placeholder={$t('shared', 'name')}
					label={$t('shared', 'name')} />
				<TextFieldV2
					name="prenom"
					bind:value={prenom}
					required
					placeholder={$t('shared', 'surname')}
					label={$t('shared', 'surname')} />
				<TextFieldV2
					name="niss"
					bind:value={niss}
					required
					placeholder={$t('form.patient', 'label.niss')}
					label={$t('form.patient', 'label.niss')}
					pattern={/^[0-9]{11}$/}
					patternMessage={$t('form.patient', 'validation.niss')} />
				<DateField
					name="date_naissance"
					bind:value={date_naissance}
					required
					placeholder={$t('form.patient', 'label.birthDate')}
					label={$t('form.patient', 'label.birthDate')} />
				<RadioFieldV2
					name="sexe"
					bind:value={sexe}
					inline
					label={$t('form.patient', 'label.sex')}
					options={[
						{ value: 'M', label: $t('form.patient', 'sex.male'), checked: patient?.sexe === 'M' },
						{ value: 'F', label: $t('form.patient', 'sex.female'), checked: patient?.sexe === 'F' }
					]} />
				<TextFieldV2
					name="adresse"
					bind:value={adresse}
					required
					placeholder={$t('shared', 'address')}
					label={$t('shared', 'address')} />
				<NumberField
					name="cp"
					bind:value={cp}
					pattern={/^[0-9]{4}$/}
					patternMessage={$t('form.postSignup', 'validation.postCode')}
					required
					placeholder={$t('form.postSignup', 'label.postCode')}
					label={$t('form.postSignup', 'label.postCode')} />
				<TextFieldV2
					name="localite"
					bind:value={localite}
					required
					placeholder={$t('form.postSignup', 'label.city')}
					label={$t('form.postSignup', 'label.city')} />
			</SectionCard>
		</div>
		<!--* Assurabilité -->
		<div class="w-full p-2 md:w-1/3 md:p-4 lg:p-8">
			<SectionCard label={$t('form.patient', 'cardLabel.assur')}>
				<MutualiteField bind:query={mutualite} />
				<TextFieldV2
					name="num_affilie"
					bind:value={num_affilie}
					placeholder={$t('form.patient', 'label.num_affilie')}
					label={$t('form.patient', 'label.num_affilie')} />
				<CheckboxFieldV2
					name="tiers_payant"
					bind:value={tiers_payant}
					placeholder={$t('form.patient', 'label.tiers_payant')}
					label={$t('form.patient', 'label.tiers_payant')} />
				<CheckboxFieldV2
					name="ticket_moderateur"
					bind:value={ticket_moderateur}
					label={$t('form.patient', 'label.ticket_moderateur')} />
				<CheckboxFieldV2
					name="bim"
					bind:value={bim}
					placeholder={$t('form.patient', 'label.bim')}
					label={$t('form.patient', 'label.bim')} />
				<TextFieldV2
					name="numero_etablissement"
					bind:value={numero_etablissement}
					placeholder={$t('sp.update', 'label.numero_etablissement')}
					label={$t('sp.update', 'label.numero_etablissement')} />
				<TextFieldV2
					name="service"
					bind:value={service}
					placeholder={$t('sp.update', 'label.service')}
					label={$t('sp.update', 'label.service')} />
			</SectionCard>
		</div>
		<!--* Contact -->
		<div class="w-full p-2 md:w-1/3 md:p-4 lg:p-8">
			<SectionCard label={$t('form.patient', 'cardLabel.contact')}>
				<TextFieldV2
					name="tel"
					bind:value={tel}
					placeholder={$t('form.patient', 'label.tel')}
					label={$t('form.patient', 'label.tel')} />
				<TextFieldV2
					name="gsm"
					bind:value={gsm}
					placeholder={$t('form.postSignup', 'label.cellPhone')}
					label={$t('form.postSignup', 'label.cellPhone')} />
			</SectionCard>
			<SubmitButton class="mt-4">
				{patient ? $t('shared', 'update') : $t('shared', 'save')}
			</SubmitButton>
		</div>
	</div>
	{message}
</FormWrapper>
