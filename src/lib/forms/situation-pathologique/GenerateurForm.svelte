<script>
	import {
		FormWrapper,
		SubmitButton,
		FieldWithPopup,
		SelectFieldV2,
		RadioFieldV2,
		CheckboxFieldV2,
		TextFieldV2,
		DateField,
		SectionCard
	} from '../index';
	import { codes } from '../../stores/conventionInami';
	import { groupes, lieux, lieuxParGroupe } from '../../stores/codeDetails';
	import { patients } from '../../stores/PatientStore';
	import { page } from '$app/stores';
	import { daysOfWeek } from '../../stores/dateHelpers';
	import { goto } from '$app/navigation';
	import DateTimeWeekDayField from './fields/DateTimeWeekDayField.svelte';
	import TimeField from './fields/TimeField.svelte';
	import WarningDisplayer from './ui/WarningDisplayer.svelte';
	import PrescriptionField from './fields/PrescriptionField.svelte';
	import DBAdapter from '../actions/dbAdapter';
	import Database from '@tauri-apps/plugin-sql';
	import dayjs from 'dayjs';
	import NombreAGenererField from './fields/NombreAGenererField.svelte';
	import PathologieLourdeFields from './fields/PathologieLourdeFields.svelte';
	import { GenerateurDeSeances } from './generateurDeSeances';
	import { t } from '../../i18n';
	import { get } from 'svelte/store';

	let numberGenMessage = '';

	let formSchema = {
		isValid: isValid,
		validators: {
			day_of_week: {
				fn: (value) => {
					for (const valueAndTime of Object.values(jour_seance_semaine_heures)) {
						if (valueAndTime.value) {
							if (!valueAndTime.time || valueAndTime == '') {
								return false;
							}
						}
					}
					return true;
				},
				errorMessage: get(t)('form.generateur', 'validator')
			}
		}
	};
	const patient = $patients.find((p) => p.patient_id == $page.params.patientId);
	const sp = patient.situations_pathologiques.find((sp) => sp.sp_id == $page.params.spId);

	async function isValid({ formData, submitter }) {
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

		let db = new DBAdapter();
		// ETAPE 5 : Construction d'un objet GénérateurDeSeances

		let generateurDeSeance = buildGenerateurDeSeance(
			sp.sp_id,
			prescription_id,
			jour_seance_semaine_heures_filtre
		);
		await db.save('generateurs_de_seances', generateurDeSeance.toDB);

		// ETAPE 6 : Génération des séances

		let conn = await Database.load('sqlite:kinehelper.db');
		generateurDeSeance.db = conn;
		console.log('generateurDeSeance', generateurDeSeance);
		let seances = await generateurDeSeance.seances();
		console.log('seances', seances);
		await conn.close();
		await db.save('seances', seances);

		// ETAPE 7 : Mise à jour de la situation pathologique
		let dateDeduite;

		if (rapport_ecrit_date == 'first') {
			dateDeduite = seances[0].date;
		} else if (rapport_ecrit_date == 'last') {
			dateDeduite = seances[seances.length - 1].date;
		} else {
			dateDeduite = rapport_ecrit_custom_date;
		}
		await db.update('situations_pathologiques', [['sp_id', sp.sp_id]], {
			intake,
			rapport_ecrit,
			rapport_ecrit_date,
			rapport_ecrit_custom_date: dateDeduite,
			with_indemnity,
			groupe_id,
			lieu_id,
			patho_lourde_type:
				groupe_id === 1
					? patho_lourde_type > 2
						? patho_lourde_type - 1
						: patho_lourde_type
					: null,
			duree,
			volet_j,
			volet_h,
			gmfcs,
			seconde_seance_fa,
			seconde_seance_e,
			duree_seconde_seance_fa,
			deja_faites,
			date_presta_chir_fa
		});

		// Etape 8 garder le store patients à jour
		patients.update((p) => {
			let rpatient = p.find((p) => p.patient_id == patient.patient_id);
			let situationPathologique = rpatient.situations_pathologiques.find(
				(sp) => sp.sp_id == $page.params.spId
			);

			situationPathologique.seances = [...situationPathologique.seances, ...seances];
			situationPathologique.intake = intake;
			situationPathologique.rapport_ecrit = rapport_ecrit;
			situationPathologique.rapport_ecrit_date = rapport_ecrit_date;
			situationPathologique.rapport_ecrit_custom_date = dateDeduite;
			situationPathologique.with_indemnity = with_indemnity;
			situationPathologique.generateurs_de_seances.push(generateurDeSeance.toDB);
			situationPathologique.groupe_id = groupe_id;
			situationPathologique.lieu_id = lieu_id;
			situationPathologique.patho_lourde_type =
				groupe_id === 1
					? patho_lourde_type > 2
						? patho_lourde_type - 1
						: patho_lourde_type
					: null;
			situationPathologique.duree = duree;
			situationPathologique.volet_j = volet_j;
			situationPathologique.volet_h = volet_h;
			situationPathologique.gmfcs = gmfcs;
			situationPathologique.seconde_seance_fa = seconde_seance_fa;
			situationPathologique.seconde_seance_e = seconde_seance_e;
			situationPathologique.duree_seconde_seance_fa = duree_seconde_seance_fa;
			situationPathologique.deja_faites = deja_faites;
			situationPathologique.date_presta_chir_fa = date_presta_chir_fa;
			return p;
		});

		goto(`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}`);
		submitter.disabled = false;
	}

	function buildGenerateurDeSeance(sp_id, prescription_id, jour_seance_semaine_heures_filtre) {
		return new GenerateurDeSeances({
			sp_id,
			prescription_id,
			patient: patient,
			seconde_seance_palliatif,
			// Le champ auto sert à déterminer si les codes sont attribués par le générateur ou si l'utilisateur souhaite surclassé le générateur pour le forcer à travailler comme cela lui semble être le mieux (comme l'ancien Kiné Helper le faisait)
			auto: true,
			groupe_id: parseInt(groupe_id),
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

	let prescription_id = sp.prescriptions.reduce((a, v) => {
		if (!a) {
			return v.prescription_id;
		}
		if (dayjs(v.date).isAfter(dayjs(a.date))) {
			return v.prescription_id;
		}
		return a;
	}, null);
	// D'abord trouver le CODE de NOMENCLATURE
	// À la base de tout il y a le groupe pathologique
	let groupe_id = sp.group_id;
	// Ensuite il y a le lieu
	let lieu_id = sp.lieu_id;
	// ensuite il y a divers champs qui vont nous mener au code final
	// pour le lieu 5 uniquement il faut définir si le patient est ambulatoire (AMB) ou hospitalisé (HOS)
	let amb_hos = 'AMB';
	// Pour les groupes 0 et 1 et le lieux 4 (Hopital) uniquement
	let duree = sp.duree ?? 0;
	let with_indemnity = true;
	// Il faudrait pouvoir déterminer si il s'agit de la première situation pathologique du patient avec ce kiné
	let intake = false;
	// L'examen à titre consultatif est préalable à une situation pathologique. Pourtant il est différencié en fonction du groupe pathologique. Il lui faut donc son potard et ses champs de formulaire à lui tout seul (Pour rajouter la prescription qui le rend valide et la date à laquelle le rajouter. il faut que tout cela soit explicité sur le fomulaire)
	let examen_consultatif = false;
	let examen_ecrit_date;
	// Compter un rapport écrit ? première séance, dernière séance, date custom
	let rapport_ecrit = false;
	let rapport_ecrit_date;
	let rapport_ecrit_custom_date;
	// Le volet J pour la patho Fa (120 séances)
	let volet_j = sp.volet_j ?? false;
	// Sous spécifiques conditions une seconde séance par jour peut être octroyée pour les patients du volet c
	let seconde_seance_fa = false;
	let duree_seconde_seance_fa = 0; // 15 ou 30 min
	let date_presta_chir_fa;
	// Tarification Fa, spécifier si des codes pathologies courantes ont été attestés
	let nombre_code_courant_fa = 0;
	// volet H - Lymphoedème
	let volet_h = sp.volet_h ?? false;
	// Patho lourde
	let patho_lourde_type = sp.patho_lourde_type ?? 0;
	let gmfcs = sp.gmfcs ?? 0;
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
		.reduce(
			(a, v) => ({
				...a,
				[v.value]: { value: false, time: undefined, seconde_seance_time: undefined }
			}),
			{}
		);
	// TROUVER LE NOMBRE
	let deja_faites = 0;
	let nombre_seances;
	let default_seance_description;

	// Pour les groupes il y a les options suivantes :
	let groupOptions = groupes()
		.map((value, index) => {
			if ([0, 1, 3, 4, 5, 6, 7].includes(index)) {
				return { label: value, value: `${index}`, id: `group${index}` };
			}
		})
		.filter((value) => {
			if (sp.group_id) {
				return value.value === sp.group_id;
			}
			return value;
		});

	let lieuOptions;
	// Ici il est nécessaire de filtrer les lieux en fonction du groupe sélectionné ici ça peut être un computed pour pouvoir tenir la variation de groupe
	$: {
		lieuOptions = lieux()
			.map((val, index) => {
				if (groupe_id === 'undefined' || groupe_id == undefined) {
					return undefined;
				}
				let groupSchema = lieuxParGroupe[parseInt(groupe_id)];
				if (groupSchema[0] === '*' || groupSchema.includes(index)) {
					return { label: val, value: index, id: `lieu${index}` };
				}
			})
			.filter((val) => {
				if (sp.lieu_id) {
					return val?.value === sp.lieu_id;
				}
				return val;
			});
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
	}
	$: has_seconde_seance = seconde_seance_fa || seconde_seance_e || seconde_seance_palliatif;

	function defaultSeanceNumber() {
		nombre_seances = sp.prescriptions.find(
			(p) => p.prescription_id == prescription_id
		).nombre_seance;
	}
</script>

<FormWrapper {formSchema} class="group/form flex flex-wrap space-y-2 px-4">
	<SectionCard label={$t('form.generateur', 'card.title')}>
		<PrescriptionField bind:value={prescription_id} />
	</SectionCard>

	<SectionCard label={$t('form.generateur', 'card.title2')}>
		<!--? Trouver le code -->
		<div class="space-y-4">
			<!--? Le Champ Groupe Pathologique -->
			<SelectFieldV2
				name="groupe"
				bind:value={groupe_id}
				options={groupOptions}
				placeholder={$t('form.generateur', 'group.placeholder')}
				label={$t('form.generateur', 'group.label')}
				required />
			<!--? Le champ Lieu -->
			{#if groupe_id && groupe_id !== 'undefined'}
				<SelectFieldV2
					name="lieu"
					bind:value={lieu_id}
					options={lieuOptions}
					placeholder={$t('form.generateur', 'lieu.placeholder')}
					label={$t('form.generateur', 'lieu.label')}
					required />
			{/if}
			{#if lieu_id === 3}
				<CheckboxFieldV2
					name="with_indemnity"
					label={$t('sp.update', 'label.with_indemnity')}
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
					label={$t('form.generateur', 'duree.label')}
					required />
			{/if}
			<!--? le champ Rapport écrit -->
			{#if [1, 4, 5].includes(parseInt(groupe_id)) && ![6, 7].includes(parseInt(lieu_id))}
				<div>
					<h5 class="select-none text-surface-500 dark:text-surface-300">Rapport écrit</h5>
					<CheckboxFieldV2
						name="rapport_ecrit"
						bind:value={rapport_ecrit}
						label={$t('form.generateur', 'rapport.label')} />
					{#if rapport_ecrit}
						<RadioFieldV2
							name="rapport_ecrit_date"
							label={$t('form.generateur', 'rapport.date')}
							bind:value={rapport_ecrit_date}
							options={[
								{ value: 'first', label: $t('form.generateur', 'rapport.first') },
								{ value: 'last', label: $t('form.generateur', 'rapport.last') },
								{ value: 'custom', label: $t('form.generateur', 'rapport.custom') }
							]} />
						{#if rapport_ecrit_date == 'custom'}
							<DateField
								label={$t('form.generateur', 'rapport.custom')}
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
						{$t('form.generateur', 'examination.label')}
					</h5>
					<CheckboxFieldV2
						name="examen_consultatif"
						bind:value={examen_consultatif}
						label={$t('form.generateur', 'examination.label2')} />
					{#if examen_consultatif}
						<DateField
							label={$t('form.generateur', 'examination.date')}
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
					label={$t('form.generateur', 'amb_hos')}
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
					<CheckboxFieldV2
						name="intake"
						label={$t('form.generateur', 'intake.label')}
						bind:value={intake} />
				</div>
			{/if}
			<!--? Pour le groupe Fa si il s'agit d'un volet j) il faut l'indiquer car cela change le nombre de séance autorisée d'un facteur 2. Aussi peut tarifier avec les codes pathologies courantes si pas sûr de la situation pathologique. Aussi sous conditions le volet c) peut bénéficier d'une seconde séance par jour -->
			{#if parseInt(groupe_id) == 4}
				<FieldWithPopup target="volet_j">
					<span slot="content">{$t('form.generateur', 'info.j')}</span>
					<div class="flex flex-col">
						<h5 class="select-none text-surface-500 dark:text-surface-300">
							{$t('form.generateur', 'j')}
						</h5>
						<CheckboxFieldV2
							name="volet_j"
							label={$t('form.generateur', 'j.label')}
							bind:value={volet_j} />
					</div>
				</FieldWithPopup>
				<FieldWithPopup target="tarificationFA">
					<span slot="content"
						><span class="text-surface-100 dark:text-surface-300"
							>{@html $t('form.generateur', 'j.help')}</span>
						<div class="flex flex-col">
							<h5 class="select-none text-surface-500 dark:text-surface-300">
								{$t('form.generateur', 'tarification.title')}
							</h5>
							<CheckboxFieldV2
								name="nombre_code_courant_fas"
								label={$t('form.generateur', 'tarification.label')}
								bind:value={nombre_code_courant_fa} />
						</div>
					</span></FieldWithPopup>
			{/if}
			<!--? MODIFICATION car secondes séances/jour peut s'appliquer dans d'autre cas que la fa lorsque la séance est effectuée en hopital (USI) -->
			{#if parseInt(groupe_id) == 5 || (parseInt(groupe_id) === 0 && parseInt(lieu_id) === 6)}
				<div class="flex flex-col">
					<h5 class="select-none text-surface-500 dark:text-surface-300">
						{$t('form.generateur', 'second.title')}
					</h5>
					<CheckboxFieldV2
						name="seconde_seance_fa"
						label={$t('form.generateur', 'second.label')}
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
						label={$t('form.generateur', 'duree.label')}
						required />
					{#if parseInt(duree_seconde_seance_fa) == 0}
						<DateField
							label={$t('form.generateur', 'second_fa.label')}
							required
							parentClass="flex-row flex"
							name="date_presta_chir_fa"
							bind:value={date_presta_chir_fa} />

						<h5 class="select-none text-surface-500 dark:text-surface-300">
							{@html $t('form.generateur', 'second_fa.help')}
						</h5>
					{:else}
						<h5 class="select-none text-surface-500 dark:text-surface-300">
							{$t('form.generateur', 'second_fa.help2')}
						</h5>
					{/if}
				{/if}
			{/if}
			<!--? Fb -->
			{#if parseInt(groupe_id) == 5}
				<FieldWithPopup target="volet_h">
					<span slot="content">{@html $t('form.generateur', 'h.help')}</span>
					<div class="flex flex-col">
						<h5 class="select-none text-surface-500 dark:text-surface-300">
							{$t('form.generateur', 'h')}
						</h5>
						<CheckboxFieldV2
							name="volet_h"
							label={$t('form.generateur', 'h.label')}
							bind:value={volet_h} />
					</div>
				</FieldWithPopup>
			{/if}
			<!--? Palliatif à domicile -->
			{#if parseInt(groupe_id) == 6}
				<FieldWithPopup target="palliatifSecondeSeance">
					<span slot="content">{$t('form.generateur', 'pallia.help')}</span>
					<div class="flex flex-col">
						<h5 class="select-none text-surface-500 dark:text-surface-300">
							{$t('form.generateur', 'second.title')}
						</h5>
						<CheckboxFieldV2
							name="seconde_seance_palliatif"
							label={$t('form.generateur', 'second.label')}
							bind:value={seconde_seance_palliatif} />
					</div>
				</FieldWithPopup>
			{/if}
			<!--? Indications relatives au groupe Hopital de jour -->
			{#if parseInt(groupe_id) == 7}
				<WarningDisplayer descriptionLines={[$t('form.generateur', 'warning')]} />
			{/if}
		</div>
	</SectionCard>

	<SectionCard label={$t('form.generateur', 'card.title3')}>
		<!--? Trouver les dates -->
		<div class="flex flex-col items-start space-y-4">
			<DateTimeWeekDayField
				bind:value={jour_seance_semaine_heures}
				with_seconde_seance={has_seconde_seance} />
			<DateField
				label={$t('form.annexeA', 'label.date')}
				required
				name={$t('form.annexeA', 'label.date')}
				bind:value={premiere_seance} />
			{#if dayjs(premiere_seance).isValid() && !Object.keys(jour_seance_semaine_heures)
					.filter((weekDay) => {
						return jour_seance_semaine_heures[weekDay].value;
					})
					.includes(dayjs(premiere_seance).day().toString())}
				<TimeField
					label={$t('form.generateur', 'heure.label')}
					name="derniere_seanceGen"
					bind:value={premiere_seance_heure} />
			{/if}
		</div>
	</SectionCard>
	<SectionCard label={$t('form.generateur', 'card.title4')}>
		<!--? Trouver le nombre -->
		<div class="space-y-4">
			<!--? Si ce n'est plus le premier générateur et que des séances ont bien été générée alors le champ déjà faite devraient être en readOnly avec sa valeur bloquée sur Zéro -->
			<!--! à cause de la confusion que cela pourrait apporter d'avoir un champ déjà_faite bloqué sur zéro, le mieux c'est qu'il ne s'affiche simplement plus -->
			<NombreAGenererField
				{defaultSeanceNumber}
				hideDejaFaites={sp.deja_faites ?? false}
				bind:dejaFaites={deja_faites}
				bind:nombreSeances={nombre_seances} />
			<h1 class="text-error-500">{numberGenMessage}</h1>
		</div>
	</SectionCard>
	<!--? Valeurs par défaut -->
	<SectionCard label={$t('form.generateur', 'card.title5')}>
		<div class="space-y-4">
			<TextFieldV2
				name="default_seance_description"
				placeholder={$t('form.generateur', 'description.label')}
				label={$t('form.generateur', 'description.label')}
				bind:value={default_seance_description} />
		</div>
	</SectionCard>
	<SubmitButton class="my-4" />
</FormWrapper>
