<script>
	import {
		FormWrapper,
		SubmitButton,
		FieldWithPopup,
		SelectFieldV2,
		RadioFieldV2,
		CheckboxFieldV2,
		DefaultFieldWrapper,
		TextFieldV2,
		DateField,
		NumberField
	} from '../index';
	import FileField from "../prescription/FileField.svelte";
	import DBAdapter from '../actions/dbAdapter';
	import { GenerateurDeSeances } from './generateurDeSeances';
	import Database from '@tauri-apps/plugin-sql';
	import { user } from '$lib/index';
	import { getToastStore, popup } from '@skeletonlabs/skeleton';
	import { errorToast } from '$lib/ui/toasts';
	import { setContext } from 'svelte';
	import { groupes, lieux, lieuxParGroupe } from '../../stores/codeDetails';
	import PathologieLourdeFields from './fields/PathologieLourdeFields.svelte';
	import SectionWrapper from './sections/SectionWrapper.svelte';
	import { codes } from '../../stores/conventionInami';
	import { maxLegalNumberSeance } from './legalNumberSeance';
	import WarningDisplayer from './ui/WarningDisplayer.svelte';
	import DateTimeWeekDayField from './fields/DateTimeWeekDayField.svelte';
	import { daysOfWeek } from '../../stores/dateHelpers';
	import NombreAGenererField from './fields/NombreAGenererField.svelte';
	import SubSectionTitle from './sections/SubSectionTitle.svelte';
	import SectionTitle from './sections/SectionTitle.svelte';
	import PrescripteurField from '../prescription/PrescripteurField.svelte';
	import { get } from 'svelte/store';
	import dayjs from 'dayjs';
	import { SituationPathologique } from '../../stores/PatientStore';
	import TimeField from './fields/TimeField.svelte';

	const toastStore = getToastStore();
	let message = '';
	let numberGenMessage = '';

	export let patient;

	let additionalValidators = {};

	function addValidators(validators) {
		console.log('In add validators with', validators);
		addValidators = { ...addValidators, ...validators };
	}
	setContext('validators', addValidators);

	let formSchema = {
		isValid: isValid,
		validators: {
			day_of_week: {
				fn: (value) => {
					console.log('in day_of_week validator with', value);
					for (const valueAndTime of Object.values(jour_seance_semaine_heures)) {
						if (valueAndTime.value) {
							if (!valueAndTime.time || valueAndTime == '') {
								return false;
							}
						}
					}
					return true;
				},
				errorMessage: 'Veuillez indiquer une heure svp'
			},
			...additionalValidators
		}
	};

	async function isValid({ formData, submitter }) {
		console.log('in IsValid with', formData);
		console.log(jour_seance_semaine_heures);

		// ETAPE 1 : Normaliser les données => day of week

		let jour_seance_semaine_heures_filtre = {};
		for (const jour of Object.entries(jour_seance_semaine_heures)) {
			if (jour[1].value) {
				jour_seance_semaine_heures_filtre = {
					...jour_seance_semaine_heures_filtre,
					[jour[0]]: jour[1].time
				};
			}
		}
		if (Object.keys(jour_seance_semaine_heures_filtre).length < 1) {
			message = 'Veuillez choisir les jours et les heures svp';
			return;
		}

		// ETAPE 2 : Initialisation des handlers

		let db = new DBAdapter();
		let sp_id = crypto.randomUUID();
		let prescription_id = crypto.randomUUID();

		// ETAPE 3 : Construction d'un objet Situation Pathologique et envoi à la db

		let situation_pathologique = buildSituationPathologiqueObject(sp_id);
		await db.save('situations_pathologiques', situation_pathologique);

		// ETAPE 4 : Construction d'un object Prescription

		console.log(jour_seance_semaine_heures_filtre);
		let prescription = buildPrescriptionObject(sp_id, prescription_id);
		await db.save('prescriptions', prescription);
		await db.saveFile(
			`${get(user).user.id}/${patient.patient_id}/${prescription_id}`,
			prescriptionFile
		);
		situation_pathologique.prescriptions.push(prescription);

		// ETAPE 5 : Construction d'un objet GénérateurDeSeances

		let conn = await Database.load('sqlite:kinehelper.db');
		let generateurDeSeance = buildGenerateurDeSeance(
			sp_id,
			prescription_id,
			jour_seance_semaine_heures_filtre
		);
		generateurDeSeance.db = conn;
		await db.save('generateurs_de_seances', generateurDeSeance.toDB);
		situation_pathologique.generateurs_de_seances.push(generateurDeSeance);

		// ETAPE 6 : Génération des séances

		let seances = await generateurDeSeance.seances();
		await db.save('seances', seances);
		await conn.close();
		situation_pathologique.seances = seances;

		console.log(prescription, situation_pathologique, generateurDeSeance, seances);
		// if Error
		// toastStore.trigger(
		// 		errorToast(
		// 			`<span class="text-error-700 text-lg">Erreur </span> <br>info : "${error}"`
		// 		)
		// 	);
		// 	throw new Error(error);
		// Etape Finale => submitter reset
		submitter.disabled = false;
	}

	function buildSituationPathologiqueObject(sp_id) {
		return new SituationPathologique({
			sp_id,
			patient_id: patient.patient_id,
			motif,
			plan_du_ttt,
			intake,
			rapport_ecrit,
			rapport_ecrit_date,
			rapport_ecrit_custom_date,
			with_indemnity,
			service,
			numero_etablissement
		});
	}
	function buildPrescriptionObject(sp_id, prescription_id) {
		return {
			sp_id,
			prescription_id,
			patient_id: patient.patient_id,
			user_id: get(user).user.id,
			date,
			nombre_seance,
			seance_par_semaine,
			jointe_a,
			prescripteur: {
				nom: prescripteurNom,
				prenom: prescripteurPrenom,
				inami: prescripteurInami
			}
		};
	}
	function buildGenerateurDeSeance(sp_id, prescription_id, jour_seance_semaine_heures_filtre) {
		return new GenerateurDeSeances({
			sp_id,
			prescription_id,
			patient,
			seconde_seance_palliatif,
			// Le champ auto sert à déterminer si les codes sont attribués par le générateur ou si l'utilisateur souhaite surclassé le générateur pour le forcer à travailler comme cela lui semble être le mieux (comme l'ancien Kiné Helper le faisait)
			auto: true,
			groupe_id,
			lieu_id,
			amb_hos,
			duree,
			examen_consultatif,
			examen_ecrit_date,
			volet_j,
			seconde_seance_fa,
			duree_seconde_seance_fa,
			nombre_code_courant_fa,
			volet_h,
			patho_lourde_type,
			gmfcs,
			seconde_seance_e,
			premiere_seance,
			premiere_seance_heure,
			jour_seance_semaine_heures: jour_seance_semaine_heures_filtre,
			deja_faites,
			nombre_seances,
			date_presta_chir_fa,
			default_seance_description
		});
	}
	// Prescription
	let date;
	let nombre_seance;
	let seance_par_semaine;
	let jointe_a;
	let prescriptionFile;
	let prescripteurNom;
	let prescripteurPrenom;
	let prescripteurInami;
	// Infos légales pour la déclaration d'une situation pathologique
	let motif;
	let plan_du_ttt;
	let service;
	let numero_etablissement;
	let with_indemnity = true;
	// D'abord trouver le CODE de NOMENCLATURE
	// À la base de tout il y a le groupe pathologique
	let groupe_id;
	// Ensuite il y a le lieu
	let lieu_id;
	// ensuite il y a divers champs qui vont nous mener au code final
	// pour le lieu 5 uniquement il faut définir si le patient est ambulatoire (AMB) ou hospitalisé (HOS)
	let amb_hos = 'AMB';
	// Pour les groupes 0 et 1 et le lieux 4 (Hopital) uniquement
	let duree;
	// Il faudrait pouvoir déterminer si il s'agit de la première situation pathologique du patient avec ce kiné
	let intake = false;
	// L'examen à titre consultatif est préalable à une situation pathologique. Pourtant il est différencié en fonction du groupe pathologique. Il lui faut donc son potard et ses champs de formulaire à lui tout seul (Pour rajouter la prescription qui le rend valide et la date à laquelle le rajouter. il faut que tout cela soit explicité sur le fomulaire)
	let examen_consultatif = false;
	let examen_ecrit_date;
	// Compter un rapport écrit ? première séance, dernière séance, date custom
	let rapport_ecrit = false;
	let rapport_ecrit_date = 'first';
	let rapport_ecrit_custom_date;
	// Le volet J pour la patho Fa (120 séances)
	let volet_j = false;
	// Sous spécifiques conditions une seconde séance par jour peut être octroyée pour les patients du volet c
	let seconde_seance_fa = false;
	let duree_seconde_seance_fa = 0; // 15 ou 30 min
	let date_presta_chir_fa;
	// Tarification Fa, spécifier si des codes pathologies courantes ont été attestés
	let nombre_code_courant_fa = 0;
	// volet H - Lymphoedème
	let volet_h = false;
	// Patho lourde
	let patho_lourde_type = 0;
	let gmfcs;
	let seconde_seance_e = false;
	let seconde_seance_palliatif = false;
	// TROUVER LA DATE
	// date de la première séance
	let premiere_seance;
	// heure de la première séance Uniquement si le jour de la première séance n'est pas un des jours de la semaine sélectionné dans le DateTimeWeekDayField
	let premiere_seance_heure;
	let jour_seance_semaine_heures = daysOfWeek
		.map((value, index) => {
			return {
				id: value.substring(0, 2),
				label: value,
				name: 'day_of_week',
				value: index == 6 ? '0' : `${index + 1}`
			};
		})
		.reduce((a, v) => ({ ...a, [v.value]: { value: false, time: undefined, seconde_seance_time: undefined } }), {});
	// TROUVER LE NOMBRE
	let deja_faites = 0;
	let nombre_seances;
	let default_seance_description;

	// Pour les groupes il y a les options suivantes :
	let groupOptions = groupes
		.map((value, index) => {
			if ([0, 1, 3, 4, 5, 6, 7].includes(index)) {
				return { label: value, value: `${index}`, id: `group${index}` };
			}
		})
		.filter((value) => value);

	let lieuOptions;
	// Ici il est nécessaire de filtrer les lieux en fonction du groupe sélectionné ici ça peut être un computed pour pouvoir tenir la variation de groupe
	$: {
		lieuOptions = lieux
			.map((val, index) => {
				if (groupe_id === 'undefined' || groupe_id == undefined) {
					return undefined;
				}
				let groupSchema = lieuxParGroupe[parseInt(groupe_id)];
				if (groupSchema[0] === '*' || groupSchema.includes(index)) {
					console.log(
						`In lieuOptions with groupSchema == ${groupSchema}, value from mapfn == ${val}`
					);
					return { label: val, value: index, id: `lieu${index}` };
				}
			})
			.filter((val) => val);
		// Remettre le champ à zéro pour éviter les input invisibles ou sur l'unique valeure
		let groupCasted = parseInt(groupe_id);
		if (groupCasted == 6) {
			lieu_id = 3;
		} else if (groupCasted == 7) {
			lieu_id = 6;
		} else {
			lieu_id = 'undefined';
		}
	}
	// Ici il faut sans arrêt recalculer le code jusqu'à ce qu'il n'y en ait plus qu'un. à ce moment là on pourrait, par exemple changer l'interface pour signaler que c'est bon.
	let code = [];
	$: {
		let groupCasted = parseInt(groupe_id);
		let lieuCasted = parseInt(lieu_id);
		let groupesADureeVariable = [0, 1];
		code = codes.filter((element) => {
			let groupOk = element.groupe == groupCasted;
			let lieuOk =
				lieu_id !== undefined || lieu_id !== 'undefined' ? element.lieu == lieuCasted : true;
			return (
				groupOk &&
				element.type == 0 &&
				lieuOk &&
				(lieuCasted == 7 ? element.amb_hos == amb_hos : true) &&
				(lieuCasted == 6
					? element.duree == duree && groupesADureeVariable.includes(groupe_id)
					: true) &&
				(volet_h ? element.pathologie == volet_h : true) &&
				(duree ? element.duree == duree : true)
			);
		});
		console.log(code);
	}
	$: dateFieldsCompleted =
		premiere_seance &&
		Object.values(jour_seance_semaine_heures).reduce((a, b) => {
			let truth = b.value ? (b.time && b.time != '' ? true : false) : true;
			return a && truth;
		}) &&
		Object.values(jour_seance_semaine_heures).filter((val) => val.value).length > 0;
	$: legalInfosCompleted = motif && plan_du_ttt;
	$: prescriptionCompleted = date && nombre_seance && seance_par_semaine && prescriptionFile;
	function defaultSeanceNumber() {
		if (code.length == 1) {
			let seancePerWeek = 0;
			for (const day of Object.values(jour_seance_semaine_heures)) {
				if (day.value) {
					seancePerWeek++;
				}
			}
			nombre_seances = maxLegalNumberSeance[parseInt(groupe_id)].seance_gen_nombre(
				parseInt(lieu_id),
				{
					duree,
					volet_h,
					volet_j,
					patho_lourde_type,
					gmfcs,
					patient,
					seancePerWeek,
					volet_h
				}
			);
		} else {
			numberGenMessage = "Veuillez d'abord trouver le code et les dates svp";
		}
	}
	$: has_seconde_seance = seconde_seance_fa || seconde_seance_e || seconde_seance_palliatif;
</script>

<!--! Le projet est trop complexe pour être brisé en petits composants pour l'instant. Au moins jusqu'à l'avènement de Svelte 5 -->
<FormWrapper {formSchema} class="">
	<div class="flex flex-col flex-wrap md:flex-row">
		<div class="w-full md:p-4">
			<!--? Prescription Form -->
			<SectionWrapper>
				<span slot="title">
					<h3
						class:!text-success-600={prescriptionCompleted}
						class:dark:!text-success-400={prescriptionCompleted}
						class="cursor-default select-none text-xl text-tertiary-600 dark:text-tertiary-400">
						{prescriptionCompleted ? 'Prescription ✓' : 'Prescription'}
					</h3>
					<p class="cursor-default select-none dark:text-surface-400">
						Enregistrer une prescription pour cette situation pathologique.
					</p>
				</span>
				<span slot="fields" class="flex flex-col items-start space-y-4">
					<PrescripteurField bind:prescripteurNom bind:prescripteurPrenom bind:prescripteurInami />
					<DateField required label="Date de la prescription" bind:value={date} name="date" />
					<NumberField
						required
						label="Nombre de séances prescrites"
						bind:value={nombre_seance}
						on:change={() => {
							nombre_seances = nombre_seance;
						}}
						name="nombre_seance" />
					<NumberField
						required
						label="Nombre de séances par semaine"
						bind:value={seance_par_semaine}
						name="seance_par_semaine" />
					<!--? file dialog field -->
						<FileField />
					<DateField
						label="Date de l'attestation à laquelle la prescription est jointe"
						bind:value={jointe_a}
						name="jointe_a" />
					<p class="text-surface-800 dark:text-surface-100">
						Ce champs est nécessaire uniquement si vous n'êtes pas en possession de la prescription
						et qu'elle est jointe à une attestation que vous n'avez pas enregistrée dans le logiciel.
					</p>
				</span>
			</SectionWrapper>

			<!--? Situation pathologique -->
			<SectionWrapper>
				<span slot="title">
					<h3
						class:!text-success-600={legalInfosCompleted}
						class:dark:!text-success-400={legalInfosCompleted}
						class="cursor-default select-none text-xl text-tertiary-600 dark:text-tertiary-400">
						{legalInfosCompleted ? 'Informations légales ✓' : 'Informations légales'}
					</h3>
					<p class="cursor-default select-none dark:text-surface-400">
						Enregistrer les informations légales minimales de la situation pathologique.
					</p>
				</span>
				<span slot="fields" class="flex flex-col items-start space-y-4">
					<DefaultFieldWrapper>
						<label class="select-none text-surface-500 dark:text-surface-300" for="motif"
							>Motif
							<textarea
								id="motif"
								bind:value={motif}
								required
								name="motif"
								class="textarea mt-2 rounded-lg"
								placeholder="Motivation justifiant une prise en charge kinésithérapeutique"
								rows="4"></textarea>
						</label>
					</DefaultFieldWrapper>
					<DefaultFieldWrapper>
						<label class="select-none text-surface-500 dark:text-surface-300" for="plan_du_ttt"
							>Plan du traitement

							<textarea
								id="plan_du_ttt"
								bind:value={plan_du_ttt}
								name="plan_du_ttt"
								required
								class="textarea mt-2 rounded-lg"
								placeholder="Un plan succinct du traitement kinésithérapeutique"
								rows="4"></textarea>
						</label>
					</DefaultFieldWrapper>
					<SubSectionTitle
						titre="Optionnel"
						description="Pour évitez d'avoir à réécrire le service et le numéro d'établissement sur chaque attestation, vous pouvez les indiquer ici et Kiné Helper les rendra disponibles lorsque cela sera nécessaire." />
					<TextFieldV2 name="service" bind:value={service} placeholder="service" label="Service" />
					<TextFieldV2
						name="numero_etablissement"
						bind:value={numero_etablissement}
						placeholder="N° d'établissement"
						label="Numéro d'établissement" />
				</span>
			</SectionWrapper>

			<!--? Générateur de séance -->
			<SectionWrapper>
				<span slot="title">
					<SectionTitle
						titre="Générateur de séances"
						titreDone="Générateur de séances prêt ✓"
						description="Choisissez parmis les options pour que le générateur de séances sache quel code assigner
						à chaque séance"
						done={code.length == 1 && dateFieldsCompleted && nombre_seances} />
				</span>
				<span slot="fields" class="flex flex-col items-start">
					<!--? Trouver le code -->
					<SubSectionTitle
						done={code.length == 1}
						titre="Définir les codes"
						description="Choisissez parmis les options pour que le générateur de séances sache quel code
					assigner à chaque séance" />
					<div class="space-y-4">
						<!--? Le Champ Groupe Pathologique -->
						<SelectFieldV2
							name="groupe"
							bind:value={groupe_id}
							options={groupOptions}
							placeholder="Choisir un groupe pathologique"
							label="Groupe pathologique"
							required />
						<!--? Le champ Lieu -->
						{#if groupe_id && groupe_id !== 'undefined'}
							<SelectFieldV2
								name="lieu"
								bind:value={lieu_id}
								options={lieuOptions}
								placeholder="Choisir un lieu"
								label="Lieu par séance"
								required />
						{/if}
						{#if lieu_id === 3}
							<CheckboxFieldV2
								name="with_indemnity"
								label="Compter les indemnités de déplacements"
								bind:value={with_indemnity} />
						{/if}
						<!--? Si le groupe est Patho Courante ou Lourde ET le lieu est en hopital (4) alors il y a deux cas de figures : des séances de 30 min. ou des séances de 15 min qui mèneront chacun à un code spécifique -->
						{#if [0, 1].includes(parseInt(groupe_id)) && parseInt(lieu_id) == 6}
							<RadioFieldV2
								name="duree"
								bind:value={duree}
								options={[
									{ value: 0, label: '15min' },
									{ value: 2, label: '30min' }
								]}
								inline
								label="15 ou 30 minutes ?"
								required />
						{/if}
						<!--? le champ Rapport écrit -->
						{#if [1, 4, 5].includes(parseInt(groupe_id)) && ![6, 7].includes(parseInt(lieu_id))}
							<div>
								<h5 class="select-none text-surface-500 dark:text-surface-300">Rapport écrit</h5>
								<CheckboxFieldV2
									name="rapport_ecrit"
									bind:value={rapport_ecrit}
									label="Ajouter un code rapport écrit" />
								{#if rapport_ecrit}
									<RadioFieldV2
										name="rapport_ecrit_date"
										label="Date du rapport"
										bind:value={rapport_ecrit_date}
										options={[
											{ value: 'first', label: 'Ajouter le rapport lors de la première séance' },
											{ value: 'last', label: 'Ajouter le rapport lors de la dernière séance' },
											{ value: 'custom', label: 'date personalisée' }
										]} />
									{#if rapport_ecrit_date == 'custom'}
										<DateField
											label="Date personnalisée : "
											parentClass="flex-row flex"
											name="rapport_ecrit_custom_date"
											bind:value={rapport_ecrit_custom_date} />
									{/if}
								{/if}
							</div>
						{/if}
						<!--? Examen à titre consultatif -->
						{#if [0, 1, 4, 5].includes(parseInt(groupe_id)) && [0, 1, 2, 3].includes(parseInt(lieu_id))}
							<div>
								<h5 class="select-none text-surface-500 dark:text-surface-300">
									Examen à titre consultatif
								</h5>
								<CheckboxFieldV2
									name="examen_consultatif"
									bind:value={examen_consultatif}
									label="Ajouter un examen à titre consultatif" />
								{#if examen_consultatif}
									<DateField
										label="Date de l'examen à titre consultatif : "
										parentClass="flex-row flex"
										name="examen_ecrit_date"
										bind:value={examen_ecrit_date} />
								{/if}
							</div>
						{/if}
						<!--? Si le lieu sélectionné est Centre de Rééducation (5) alors le patient peut soit être traité en Ambulatoire (AMB) ou hospitalisé (HOS) -->
						{#if parseInt(lieu_id) == 7}
							<RadioFieldV2
								name="Amb_hos"
								bind:value={amb_hos}
								options={[
									{ value: 'AMB', label: 'AMB' },
									{ value: 'HOS', label: 'HOS' }
								]}
								inline
								label="Ambulatoire ou Hospitalisé ?"
								required />
						{/if}
						<!--? Pathologie Lourde -->
						{#if parseInt(groupe_id) == 1}
							<PathologieLourdeFields
								bind:pathologieLourde={patho_lourde_type}
								bind:GMFCSScore={gmfcs}
								bind:secondeSeance={seconde_seance_e} />
						{/if}
						<!--? Pour le groupe 1 il y a un intake possible pour tout les groupes avec 1 warning cependant -->
						{#if parseInt(groupe_id) == 0}
							<div>
								<h5 class="select-none text-surface-500 dark:text-surface-300">Intake</h5>
								<CheckboxFieldV2 name="intake" label="Ajouter un Intake" bind:value={intake} />
							</div>
						{/if}
						<!--? Pour le groupe Fa si il s'agit d'un volet j) il faut l'indiquer car cela change le nombre de séance autorisée d'un facteur 2. Aussi peut tarifier avec les codes pathologies courantes si pas sûr de la situation pathologique. Aussi sous conditions le volet c) peut bénéficier d'une seconde séance par jour -->
						{#if parseInt(groupe_id) == 4}
							<FieldWithPopup target="volet_j">
								<span slot="content"> j) Polytraumatismes </span>
								<div class="flex flex-col">
									<h5 class="select-none text-surface-500 dark:text-surface-300">Volet J</h5>
									<CheckboxFieldV2
										name="volet_j"
										label="volet j) (120 séances)"
										bind:value={volet_j} />
								</div>
							</FieldWithPopup>
							<FieldWithPopup target="tarificationFA">
								<span slot="content"
									><span class="text-surface-100 dark:text-surface-300"
										>"La somme des codes pathologie courante et Fa normaux ne peuvent dépasser 20"
										(A.R. 9.5.2021)</span
									><br />Laisser la valeur du champ sur 0 si vous n'avez pas utilisé de code
									pathologie courante.</span>
								<div class="flex flex-col">
									<h5 class="select-none text-surface-500 dark:text-surface-300">Tarification</h5>
									<CheckboxFieldV2
										name="nombre_code_courant_fas"
										label="Tarifier les 14 premiers jours en pathologie courante ?"
										bind:value={nombre_code_courant_fa} />
								</div>
							</FieldWithPopup>
						{/if}
						<!--? MODIFICATION car secondes séances/jour peut s'appliquer dans d'autre cas que la fa lorsque la séance est effectuée en hopital (USI) -->
						{#if parseInt(groupe_id) == 5 || (parseInt(groupe_id) === 0 && parseInt(lieu_id) === 6)}
							<div class="flex flex-col">
								<h5 class="select-none text-surface-500 dark:text-surface-300">
									Seconde séance par jour
								</h5>
								<CheckboxFieldV2
									name="seconde_seance_fa"
									label="compter une seconde séance par jour"
									bind:value={seconde_seance_fa} />
							</div>
							{#if seconde_seance_fa}
								<RadioFieldV2
									name="duree_seconde_seance_fa"
									bind:value={duree_seconde_seance_fa}
									options={[
										{ value: 0, label: '15min' },
										{ value: 2, label: '30min' }
									]}
									inline
									label="15 ou 30 minutes ?"
									required />
								{#if parseInt(duree_seconde_seance_fa) == 0}
									<DateField
										label="Date de la prestation de réanimation ou orthopédie : "
										required
										parentClass="flex-row flex"
										name="date_presta_chir_fa"
										bind:value={date_presta_chir_fa} />

									<h5 class="select-none text-surface-500 dark:text-surface-300">
										Les séances de 15 minutes sont réservées aux patients pour lesquels ont été
										attesté une prestations : <br /> - de réanimation (211046, 211142, 211341,
										211761, 212225, 213021, 213043, 214045) <br />
										- de l'article 14, k, orthopédie d'une valeur égale ou supérieure à N 500 à l'exception
										des 289015, 289026, 289030, 289041, 289052, 289063, 289074, 289085. Attestable 14
										fois dans les 30 jours après la prestation.
									</h5>
								{:else}
									<h5 class="select-none text-surface-500 dark:text-surface-300">
										Les séances de 30 minutes sont réservées aux patients séjournant en : <br /> -
										soins intensifs (code 490) <br />
										- soins néonatails locaux (fonction N*)(code 190)
										<br /> - néonatologie intensive (NIC) (code 270)
										<br /> pendant toute la durée de leur séjour dans ces fonctions ou services.
									</h5>
								{/if}
							{/if}
						{/if}
						<!--? Fb -->
						{#if parseInt(groupe_id) == 5}
							<FieldWithPopup target="volet_h">
								<span slot="content"
									>Uniquement pour les pathologies du "volet H) Lymphoedème".<br />Le générateur
									utilisera les codes 639xxx.</span>
								<div class="flex flex-col">
									<h5 class="select-none text-surface-500 dark:text-surface-300">Volet H</h5>
									<CheckboxFieldV2
										name="volet_h"
										label="J'effectue un drainage"
										bind:value={volet_h} />
								</div>
							</FieldWithPopup>
						{/if}
						<!--? Palliatif à domicile -->
						{#if parseInt(groupe_id) == 6}
							<FieldWithPopup target="palliatifSecondeSeance">
								<span slot="content"
									>Uniquement pour les patients dont l'intervention personnelle est réduite tel
									qu'explicité dans l'AR du 23 mars 1982, §3.</span>
								<div class="flex flex-col">
									<h5 class="select-none text-surface-500 dark:text-surface-300">
										Seconde séance par jour
									</h5>
									<CheckboxFieldV2
										name="seconde_seance_palliatif"
										label="J'effectue une seconde séance dans la journée"
										bind:value={seconde_seance_palliatif} />
								</div>
							</FieldWithPopup>
						{/if}
						<!--? Indications relatives au groupe Hopital de jour -->
						{#if parseInt(groupe_id) == 7}
							<WarningDisplayer
								descriptionLines={[
									"Lorsque le kiné dispose d'une prescription faisant référence à la nécessité d'effectuer une séance	de kinésithérapie avant que le bénéficiaire ne quitte l'hopital."
								]} />
						{/if}
					</div>

					<!--? Trouver les dates -->
					<SubSectionTitle
						class="mt-12"
						done={dateFieldsCompleted}
						titre="Définir les dates"
						description="Choisissez les dates de vos prestations." />
					<div class="flex flex-col items-start space-y-4">
						<DateTimeWeekDayField
							bind:value={jour_seance_semaine_heures}
							with_seconde_seance={has_seconde_seance} />
						<DateField
							label="Date de la première séance"
							required
							name="premiere_seanceGen"
							bind:value={premiere_seance} />
						{#if dayjs(premiere_seance).isValid() && !Object.keys(jour_seance_semaine_heures)
								.filter((weekDay) => {
									return jour_seance_semaine_heures[weekDay].value;
								})
								.includes(dayjs(premiere_seance).day().toString())}
							<TimeField
								label="Heure de la première séance"
								required={dayjs(premiere_seance).isValid() &&
									!Object.keys(jour_seance_semaine_heures)
										.filter((weekDay) => {
											return jour_seance_semaine_heures[weekDay].value;
										})
										.includes(dayjs(premiere_seance).day().toString())}
								name="derniere_seanceGen"
								bind:value={premiere_seance_heure} />
							<p>
								Nécessaire car la première séance n'est pas dans les jours de la semaine sélectionné
							</p>
						{/if}
					</div>

					<!--? Trouver le nombre -->
					<SubSectionTitle
						class="mt-12"
						done={nombre_seances}
						titre="Nombre de séances"
						description="Définissez le nombre de séances à produire." />
					<div class="space-y-4">
						<NombreAGenererField
							{defaultSeanceNumber}
							bind:dejaFaites={deja_faites}
							bind:nombreSeances={nombre_seances} />
						<h1 class="text-error-500">{numberGenMessage}</h1>
					</div>

					<!--? Valeurs par défaut -->
					<SubSectionTitle
						class="mt-12"
						done={false}
						titre="Description séance par défaut"
						description="Optionnel, ce champ vous laisse définir une description par défaut pour les séances générées." />
					<div class="space-y-4">
						<TextFieldV2
							name="default_seance_description"
							placeholder="Description par défault"
							label="Description par défault"
							bind:value={default_seance_description} />
					</div>
				</span>
			</SectionWrapper>
		</div>
	</div>
	{#if message}
		<h1 class="text-error-500">{message}</h1>
	{/if}
	<SubmitButton>Enregistrer et générer les séances</SubmitButton>
</FormWrapper>
