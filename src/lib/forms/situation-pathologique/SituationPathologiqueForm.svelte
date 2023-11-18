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
	import { open } from '@tauri-apps/plugin-dialog';
	import { user } from '$lib/index';
	import { getToastStore, popup } from '@skeletonlabs/skeleton';
	import { errorToast } from '$lib/ui/toasts';
	import { setContext } from 'svelte';
	export let situation_pathologique = undefined;
	import { groupes, lieux, lieuxParGroupe } from '../../stores/codeDetails';
	import PathologieLourdeFields from './fields/PathologieLourdeFields.svelte';
	import SectionWrapper from './sections/SectionWrapper.svelte';
	import { codes } from '../../stores/conventionInami';
	import { maxLegalNumberSeance } from './legalNumberSeance';
	import WarningDisplayer from './ui/WarningDisplayer.svelte';
	import DateTimeWeekDayField from './fields/DateTimeWeekDayField.svelte';
	import { daysOfWeek } from '../../stores/dateHelpers';
	import NombreAGenererField from './fields/NombreAGenererField.svelte';
	import PrescriptionForm from '../prescription/PrescriptionForm.svelte';
	import SubSectionTitle from './sections/SubSectionTitle.svelte';
	import SectionTitle from './sections/SectionTitle.svelte';

	const toastStore = getToastStore();
	let message = '';

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
			password2: {
				fn: () => console.log('example'),
				errorMessage: 'Attention'
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
					...jour_seance_semaine_heures,
					[jour[0]]: jour[1].time
				};
			}
		}
		console.log(jour_seance_semaine_heures_filtre);
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
	// Prescription
	let date;
	let nombre_seance;
	let seance_par_semaine;
	let jointeAlAttestationDu;
	let prescriptionFile;
	// Infos légales pour la déclaration d'une situation pathologique
	let motif;
	let plan_du_ttt;
	let service;
	let numero_etablissement
	// D'abord trouver le CODE de NOMENCLATURE
	// À la base de tout il y a le groupe pathologique
	let groupeId;
	// Ensuite il y a le lieu
	let lieuId;
	// ensuite il y a divers champs qui vont nous mener au code final
	// pour le lieu 5 uniquement il faut définir si le patient est ambulatoire (AMB) ou hospitalisé (HOS)
	let ambHos = 'AMB';
	// Pour les groupes 0 et 1 et le lieux 4 (Hopital) uniquement
	let duree;
	// Il faudrait pouvoir déterminer si il s'agit de la première situation pathologique du patient avec ce kiné
	let intake = false;
	// L'examen à titre consultatif est préalable à une situation pathologique. Pourtant il est différencié en fonction du groupe pathologique. Il lui faut donc son potard et ses champs de formulaire à lui tout seul (Pour rajouter la prescription qui le rend valide et la date à laquelle le rajouter. il faut que tout cela soit explicité sur le fomulaire)
	let examenConsultatif = false;
	// Compter un rapport écrit ? première séance, dernière séance, date custom
	let rapportEcrit = false;
	let rapportEcritDate = 'first';
	let rapportEcritCustomDate;
	// Le volet J pour la patho Fa (120 séances)
	let voletJ = false;
	// Sous spécifiques conditions une seconde séance par jour peut être octroyée pour les patients du volet c
	let secondeSeanceFA = false;
	let dureeSecondeSeanceFA = 0; // 15 ou 30 min
	// Tarification Fa, spécifier si des codes pathologies courantes ont été attestés
	let nombreCodeCourantFA = 0;
	// volet H - Lymphoedème
	let voletH = false;
	// Patho lourde
	let pathoLourdeType = 0;
	let gmfcs;
	let secondeSeanceE;
	// TROUVER LA DATE
	// date de la première séance
	let premiereSeance;
	let jour_seance_semaine_heures = daysOfWeek
		.map((value, index) => {
			return {
				id: value.substring(0, 2),
				label: value,
				name: 'day_of_week',
				value: index == 6 ? '0' : `${index + 1}`
			};
		})
		.reduce((a, v) => ({ ...a, [v.value]: { value: false, time: undefined } }), {});
	// TROUVER LE NOMBRE
	let deja_faites = 0;
	let nombreSeances;

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
				if (groupeId === 'undefined' || groupeId == undefined) {
					console.log('bordel');
					return undefined;
				}
				console.log('mais whaaat');
				let groupSchema = lieuxParGroupe[parseInt(groupeId)];
				if (groupSchema[0] === '*' || groupSchema.includes(index)) {
					console.log(
						`In lieuOptions with groupSchema == ${groupSchema}, value from mapfn == ${val}`
					);
					return { label: val, value: index, id: `lieu${index}` };
				}
			})
			.filter((val) => val);
		// Remettre le champ à zéro pour éviter les input invisibles ou sur l'unique valeure
		let groupCasted = parseInt(groupeId);
		if (groupCasted == 6) {
			lieuId = 3;
		} else if (groupCasted == 7) {
			lieuId = 6;
		} else {
			lieuId = 'undefined';
		}
	}
	// Ici il faut sans arrêt recalculer le code jusqu'à ce qu'il n'y en ait plus qu'un. à ce moment là on pourrait, par exemple changer l'interface pour signaler que c'est bon.
	let code = [];
	$: {
		let groupCasted = parseInt(groupeId);
		let lieuCasted = parseInt(lieuId);
		let groupesADureeVariable = [0, 1];
		code = codes.filter((element) => {
			let groupOk = element.groupe == groupCasted;
			let lieuOk =
				lieuId !== undefined || lieuId !== 'undefined' ? element.lieu == lieuCasted : true;
			return (
				groupOk &&
				element.type == 0 &&
				lieuOk &&
				(lieuCasted == 7 ? element.amb_hos == ambHos : true) &&
				(lieuCasted == 6
					? element.duree == duree && groupesADureeVariable.includes(groupeId)
					: true) &&
				(voletH ? element.pathologie == voletH : true) &&
				(duree ? element.duree == duree : true)
			);
		});
		console.log(code);
	}
	$: dateFieldsCompleted =
		premiereSeance &&
		Object.values(jour_seance_semaine_heures).reduce((a, b) => {
			let truth = b.value ? (b.time && b.time != '' ? true : false) : true;
			console.log(a, b, truth);
			return a && truth;
		}) &&
		Object.values(jour_seance_semaine_heures).filter((val) => val.value).length > 0;
	$: prescriptionCompleted = date && nombre_seance && seance_par_semaine && prescriptionFile;
	function defaultSeanceNumber() {
		if (code.length == 1) {
			let seancePerWeek = 0;
			for (const day of Object.values(jour_seance_semaine_heures)) {
				if (day.value) {
					seancePerWeek++;
				}
			}
			nombreSeances = maxLegalNumberSeance[parseInt(groupeId)].seance_gen_nombre(parseInt(lieuId), {
				duree,
				voletH,
				voletJ,
				pathoLourdeType,
				gmfcs,
				patient,
				seancePerWeek,
				voletH
			});
		} else {
			message = "Veuillez d'abord trouver le code et les dates svp";
		}
	}
</script>

<!--! Le projet est trop complexe pour être brisé en autant de petits morceaux malheureusement... Il va falloir remettre l'etièreté de chaque section ICI et faire, en tout cas pour l'instant, un composant de 20 km. Au moins jusqu'à l'avènement de Svelte 5 -->
<FormWrapper {formSchema} class="">
	<!--? Top level Hidden fields  -->
	{#if situation_pathologique}
		<input type="hidden" name="sp_id" value={situation_pathologique?.sp_id} />
	{/if}
	<input type="hidden" name="patient_id" value={situation_pathologique?.patient_id} />
	<input type="hidden" name="user_id" value={$user.user.id} />
	<input type="hidden" name="created_at" value={situation_pathologique?.created_at ?? new Date()} />

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
					<DateField required label="Date de la prescription" bind:value={date} name="date" />
					<NumberField
						required
						label="Nombre de séances prescrites"
						bind:value={nombre_seance}
						name="nombre_seance" />
					<NumberField
						required
						label="Nombre de séances par semaine"
						bind:value={seance_par_semaine}
						name="seance_par_semaine" />
					<!--? file dialog field -->
					<DefaultFieldWrapper>
						<label for="file-input" class="select-none text-surface-500 dark:text-surface-300"
							>Copie de la prescription
						</label>
						<input
							id="file-input"
							class="input"
							type="file"
							name="prescriptionFile"
							placeholder="Sélectionner un fichier"
							bind:files={prescriptionFile} />
					</DefaultFieldWrapper>
					<DateField
						label="Date de l'attestation à laquelle la prescription est jointe"
						bind:value={jointeAlAttestationDu}
						name="jointeAlAttestationDu" />
					<p class="text-surface-800 dark:text-surface-100">
						Ce champs est nécessaire uniquement si vous n'êtes pas en possession de la prescription
						car elle a été envoyée à une mutuelle par un autre kiné.
					</p>
				</span>
			</SectionWrapper>

			<!--? Situation pathologique -->
			<SectionWrapper>
				<span slot="title">
					<h3
						class:!text-success-600={prescriptionCompleted}
						class:dark:!text-success-400={prescriptionCompleted}
						class="cursor-default select-none text-xl text-tertiary-600 dark:text-tertiary-400">
						{prescriptionCompleted ? 'Informations légales ✓' : 'Informations légales'}
					</h3>
					<p class="cursor-default select-none dark:text-surface-400">
						Enregistrer les informations légales minimales de la situation pathologique.
					</p>
				</span>
				<span slot="fields" class="flex flex-col items-start space-y-4">
					<label class="select-none text-surface-500 dark:text-surface-300" for="motif"
						>Motif
						<textarea id="motif" bind:value={motif} required name="motif" class="textarea rounded-lg mt-2" placeholder="Motivation justifiant une prise en charge kinésithérapeutique" rows="4"></textarea>
					</label>
					<label class="select-none text-surface-500 dark:text-surface-300" for="plan_du_ttt"
						>Plan du traitement

						<textarea id="plan_du_ttt" bind:value={plan_du_ttt} name="plan_du_ttt" required class="textarea rounded-lg mt-2" placeholder="Un plan succinct du traitement kinésithérapeutique" rows="4"></textarea>
					</label>
					<SubSectionTitle titre="Optionnel" description="Pour évitez d'avoir à réécrire le service et le numéro d'établissement sur chaque attestation, vous pouvez les indiquer ici et Kiné Helper les rendra disponibles lorsque cela sera nécessaire." />
					<TextFieldV2
						name="service"
						bind:value={service}
						placeholder="service"
						label="Service" />
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
						done={code.length == 1 && dateFieldsCompleted && nombreSeances} />
				</span>
				<span slot="fields" class="flex flex-col items-start">
					<!--? Generateur_id -->
					<input type="hidden" name="generateur_id" value={crypto.randomUUID()}>
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
							bind:value={groupeId}
							options={groupOptions}
							placeholder="Choisir un groupe pathologique"
							label="Groupe pathologique"
							required />
						<!--? Le champ Lieu -->
						{#if groupeId && groupeId !== 'undefined'}
							<SelectFieldV2
								name="lieu"
								bind:value={lieuId}
								options={lieuOptions}
								placeholder="Choisir un lieu"
								label="Lieu par séance"
								required />
						{/if}
						<!--? Si le groupe est Patho Courante ou Lourde ET le lieu est en hopital (4) alors il y a deux cas de figures : des séances de 30 min. ou des séances de 15 min qui mèneront chacun à un code spécifique -->
						{#if [0, 1].includes(parseInt(groupeId)) && parseInt(lieuId) == 6}
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
						{#if [1, 4, 5].includes(parseInt(groupeId)) && ![6, 7].includes(parseInt(lieuId))}
							<div>
								<h5 class="select-none text-surface-500 dark:text-surface-300">Rapport écrit</h5>
								<CheckboxFieldV2
									name="rapportEcrit"
									bind:value={rapportEcrit}
									label="Ajouter un code rapport écrit" />
								{#if rapportEcrit}
									<RadioFieldV2
										name="rapportEcritDate"
										label="Date du rapport"
										bind:value={rapportEcritDate}
										options={[
											{ value: 'first', label: 'Ajouter le rapport lors de la première séance' },
											{ value: 'last', label: 'Ajouter le rapport lors de la dernière séance' },
											{ value: 'custom', label: 'date personalisée' }
										]} />
									{#if rapportEcritDate == 'custom'}
										<DateField
											label="Date personnalisée : "
											parentClass="flex-row flex"
											name="rapportEcritCustomDate"
											bind:value={rapportEcritCustomDate} />
									{/if}
								{/if}
							</div>
						{/if}
						<!--? Examen à titre consultatif -->
						{#if [0, 1, 4, 5].includes(parseInt(groupeId)) && [0, 1, 2, 3].includes(parseInt(lieuId))}
							<div>
								<h5 class="select-none text-surface-500 dark:text-surface-300">
									Examen à titre consultatif
								</h5>
								<CheckboxFieldV2
									name="examenConsultatif"
									bind:value={examenConsultatif}
									label="Ajouter un examen à titre consultatif" />
								{#if examenConsultatif}
									Formulaire PRescription supplémentaire + Date de l'examen + Signaler que
									"attention, le code d'examen à titre consultatif sera placé indépendamment de la
									génération des autres codes du traitement proprement dit." un truc du genre...
								{/if}
							</div>
						{/if}
						<!--? Si le lieu sélectionné est Centre de Rééducation (5) alors le patient peut soit être traité en Ambulatoire (AMB) ou hospitalisé (HOS) -->
						{#if parseInt(lieuId) == 7}
							<RadioFieldV2
								name="AmbHos"
								bind:value={ambHos}
								options={[
									{ value: 'AMB', label: 'AMB' },
									{ value: 'HOS', label: 'HOS' }
								]}
								inline
								label="Ambulatoire ou Hospitalisé ?"
								required />
						{/if}
						<!--? Pathologie Lourde -->
						{#if parseInt(groupeId) == 1}
							<PathologieLourdeFields
								bind:pathologieLourde={pathoLourdeType}
								bind:GMFCSScore={gmfcs}
								bind:secondeSeance={secondeSeanceE} />
						{/if}
						<!--? Pour le groupe 1 il y a un intake possible pour tout les groupes avec 1 warning cependant -->
						{#if parseInt(groupeId) == 0}
							<div>
								<h5 class="select-none text-surface-500 dark:text-surface-300">Intake</h5>
								<CheckboxFieldV2 name="intake" label="Ajouter un Intake" bind:value={intake} />
							</div>
						{/if}
						<!--? Pour le groupe Fa si il s'agit d'un volet j) il faut l'indiquer car cela change le nombre de séance autorisée d'un facteur 2. Aussi peut tarifier avec les codes pathologies courantes si pas sûr de la situation pathologique. Aussi sous conditions le volet c) peut bénéficier d'une seconde séance par jour -->
						{#if parseInt(groupeId) == 4}
							<FieldWithPopup target="voletJ">
								<span slot="content"> j) Polytraumatismes </span>
								<div class="flex flex-col">
									<h5 class="select-none text-surface-500 dark:text-surface-300">Volet J</h5>
									<CheckboxFieldV2
										name="voletJ"
										label="volet j) (120 séances)"
										bind:value={voletJ} />
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
										name="nombreCodeCourantFAs"
										label="Tarifier les 14 premiers jours en pathologie courante ?"
										bind:value={nombreCodeCourantFA} />
								</div>
							</FieldWithPopup>
							<div class="flex flex-col">
								<h5 class="select-none text-surface-500 dark:text-surface-300">
									Seconde séance par jour
								</h5>
								<CheckboxFieldV2
									name="secondeSeanceFA"
									label="compter une seconde séance par jour"
									bind:value={secondeSeanceFA} />
							</div>
							{#if secondeSeanceFA}
								<RadioFieldV2
									name="dureeSecondeSeanceFA"
									bind:value={dureeSecondeSeanceFA}
									options={[
										{ value: 0, label: '15min' },
										{ value: 2, label: '30min' }
									]}
									inline
									label="15 ou 30 minutes ?"
									required />
								{#if parseInt(dureeSecondeSeanceFA) == 0}
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
						{#if parseInt(groupeId) == 5}
							<FieldWithPopup target="voletH">
								<span slot="content"
									>Uniquement pour les pathologies du "volet H) Lymphoedème".<br />Le générateur
									utilisera les codes 639xxx.</span>
								<div class="flex flex-col">
									<h5 class="select-none text-surface-500 dark:text-surface-300">Volet H</h5>
									<CheckboxFieldV2
										name="voletH"
										label="J'effectue un drainage"
										bind:value={voletH} />
								</div>
							</FieldWithPopup>
						{/if}
						<!--? Palliatif à domicile -->
						{#if parseInt(groupeId) == 6}
							<FieldWithPopup target="palliatifSecondeSeance">
								<span slot="content"
									>Uniquement pour les patients dont l'intervention personnelle est réduite tel
									qu'explicité dans l'AR du 23 mars 1982, §3.</span>
								<div class="flex flex-col">
									<h5 class="select-none text-surface-500 dark:text-surface-300">Volet H</h5>
									<CheckboxFieldV2
										name="palliatifSecondeSeance"
										label="J'effectue une seconde séance dans la journée"
										bind:value={voletH} />
								</div>
							</FieldWithPopup>
						{/if}
						<!--? Indications relatives au groupe Hopital de jour -->
						{#if parseInt(groupeId) == 7}
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
					<div class="space-y-4">
						<DateField
							label="Date de la première séance"
							required
							name="premiereSeanceGen"
							bind:value={premiereSeance} />
						<DateTimeWeekDayField bind:value={jour_seance_semaine_heures} />
					</div>
					<!--? Trouver le nombre -->
					<SubSectionTitle
						class="mt-12"
						done={nombreSeances}
						titre="Nombre de séances"
						description="Définissez le nombre de séances à produire." />
					<div class="space-y-4">
						<NombreAGenererField bind:dejaFaites={deja_faites} bind:nombreSeances />
					</div>

					<!--? Valeurs par défaut -->
					<SubSectionTitle
						class="mt-12"
						done={nombreSeances}
						titre="Description séance par défaut"
						description="Optionnel, ce champ vous laisse définir une description par défaut pour les séances générées." />
					<div class="space-y-4">
						<NombreAGenererField bind:dejaFaites={deja_faites} bind:nombreSeances />
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