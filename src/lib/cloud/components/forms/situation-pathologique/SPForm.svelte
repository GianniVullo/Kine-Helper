<script>
	import { SPSchema, onValid, validateurs, fieldSchema } from './SPSchema';
	import { SubmitButton } from '../../../../forms/index';
	import { t } from '../../../../i18n';
	import Form from '../abstract-components/Form.svelte';
	import FormSection from '../abstract-components/FormSection.svelte';
	import dayjs from 'dayjs';
	import { Formulaire } from '../../../libraries/formHandler.svelte';
	import { appState } from '../../../../managers/AppState.svelte';
	import { onMount, untrack } from 'svelte';
	import NomenclatureDefinerFields from '../tarification-fields/NomenclatureDefinerFields.svelte';
	import SupplementField from '../tarification-fields/SupplementField.svelte';
	import TarifField from '../tarification-fields/TarifField.svelte';
	import { groupes, lieux, lieuxParGroupe } from '../../../../stores/codeDetails';

	let { patient, sp, mode = 'create', tarifs, supplements } = $props();

	function isItTheOne(value, id) {
		const parsedMetadata = JSON.parse(value.metadata);
		if (parsedMetadata) {
			return parsedMetadata[id];
		}
	}

	function evalTarifDefaultValue(metadata, key, subKey) {
		console.log('evalTarifDefaultValue', metadata, key, subKey);

		if (!metadata || !metadata[key]) {
			return tarifs.find((t) => isItTheOne(t, key))?.[subKey];
		} else {
			console.log('metadata[key]', metadata[key], key);

			const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
			if (uuidRegex.test(metadata[key])) {
				return tarifs.find((t) => t.id === metadata[key])?.[subKey];
			} else {
				console.log('returning metadata[key]', metadata[key]);

				return metadata[key];
			}
		}
	}
	const initialValues = {
		user_id: appState.user.id,
		patient_id: patient.patient_id,
		sp_id: sp?.sp_id ?? crypto.randomUUID(),
		created_at: dayjs().format('YYYY-MM-DD'),
		motif: sp?.motif,
		plan_du_ttt: sp?.plan_du_ttt,
		numero_etablissement: sp?.numero_etablissement,
		service: sp?.service,
		groupe_id: sp?.groupe_id,
		lieu_id: sp?.lieu_id,
		duree: sp?.duree,
		patho_lourde_type: sp?.patho_lourde_type,
		amb_hos: sp?.amb_hos,
		gmfcs: sp?.gmfcs,
		tarif_seance: evalTarifDefaultValue(sp?.metadata, 'tarif_seance', 'id'),
		tarif_indemnite: evalTarifDefaultValue(sp?.metadata, 'tarif_indemnite', 'id'),
		tarif_rapport_ecrit: evalTarifDefaultValue(sp?.metadata, 'tarif_rapport_ecrit', 'id'),
		tarif_consultatif: evalTarifDefaultValue(sp?.metadata, 'tarif_consultatif', 'id'),
		tarif_seconde_seance: evalTarifDefaultValue(sp?.metadata, 'tarif_seconde_seance', 'id'),
		tarif_intake: evalTarifDefaultValue(sp?.metadata, 'tarif_intake', 'id'),
		tarif_seance_custom: evalTarifDefaultValue(sp?.metadata, 'tarif_seance', 'valeur'),
		tarif_indemnite_custom: evalTarifDefaultValue(sp?.metadata, 'tarif_indemnite', 'valeur'),
		tarif_rapport_ecrit_custom: evalTarifDefaultValue(
			sp?.metadata,
			'tarif_rapport_ecrit',
			'valeur'
		),
		tarif_consultatif_custom: evalTarifDefaultValue(sp?.metadata, 'tarif_consultatif', 'valeur'),
		tarif_seconde_seance_custom: evalTarifDefaultValue(
			sp?.metadata,
			'tarif_seconde_seance',
			'valeur'
		),
		tarif_intake_custom: evalTarifDefaultValue(sp?.metadata, 'tarif_intake', 'valeur'),
		supplements: sp?.metadata?.supplements ?? []
	};
	console.log('initialValues', initialValues);
	let formHandler = new Formulaire({
		validateurs,
		schema: SPSchema,
		submiter: '#sp-submit',
		initialValues,
		onValid,
		mode
	});

	let displayTarifs = $derived(
		(formHandler.form.lieu_id !== 7 || formHandler.form.amb_hos) &&
			(formHandler.form.groupe_id !== 1 ||
				typeof formHandler.form.patho_lourde_type === 'number') &&
			(formHandler.form.patho_lourde_type !== 1 || formHandler.form.gmfcs) &&
			(typeof formHandler.form.patho_lourde_type === 'number' || formHandler.form.duree)
	);

	onMount(() => {
		formHandler.setup();
	});

	let groupeOptions = groupes()
		.map((val, index) => ({
			label: val,
			value: index,
			id: `groupe${index}`
		}))
		.filter((s) => {
			let gId = formHandler.form.groupe_id;
			let val = parseInt(s.value);
			console.log('gId', gId, 'val', val);
			console.log('gId === val', gId === val);
			if (
				typeof formHandler.form.groupe_id === 'number' &&
				parseInt(s.value) === formHandler.form.groupe_id
			) {
				return s;
			} else if (
				typeof formHandler.form.groupe_id === 'number' &&
				parseInt(s.value) !== formHandler.form.groupe_id
			) {
				return;
			} else {
				return s;
			}
		});

	function defaultLieuxOptions(groupe) {
		const defaultLieux = lieux().map((val, index) => ({
			label: val,
			value: index,
			id: `lieu${index}`
		}));
		if (groupe) {
			const lpG = lieuxParGroupe[formHandler.form.groupe_id];
			return defaultLieux.filter((_, index) => lpG[0] === '*' || lpG.includes(index));
		}
		return defaultLieux;
	}

	let lieuOptions = $state(defaultLieuxOptions(formHandler.form.groupe_id));

	$effect(() => {
		formHandler.form.groupe_id;
		if (typeof formHandler.form.groupe_id === 'number' && untrack(() => formHandler.isDirty)) {
			untrack(() => {
				formHandler.form.lieu_id = undefined;
				lieuOptions = defaultLieuxOptions(formHandler.form.groupe_id);
				formHandler.form.duree = undefined;
				formHandler.form.patho_lourde_type = undefined;
				formHandler.form.amb_hos = undefined;
				formHandler.form.has_seconde_seance = undefined;
				formHandler.form.gmfcs = undefined;
			});
		}
	});
</script>

<Form
	title={$t(`sp.${mode}`, 'title', { date: dayjs(sp?.created_at).format('DD/MM/YYYY') })}
	message={formHandler.message}>
	<FormSection
		titre="Informations générales"
		fields={fieldSchema}
		bind:form={formHandler.form}
		errors={formHandler.errors} />
	<FormSection
		titre="Informations relative à la nomenclature"
		description="Ces champs permettent à Kiné Helper d'assigner les bons codes de nomenclatures à vos séances. Attention, vous ne pourrez plus changer le groupe par la suite.">
		<NomenclatureDefinerFields
			{lieuOptions}
			{groupeOptions}
			bind:form={formHandler.form}
			errors={formHandler.errors} />
	</FormSection>
	<FormSection
		titre="Informations relative à la tarification"
		description="Ces champs ne sont pas obligatoires. Veuillez remplir ce qui est digne d'intérêt.">
		<!--* Si l'utilisateur n'est pas conventionné il peut utiliser les tarifs qu'il veut -->
		{#if !appState.user.conventionne}
			{#if displayTarifs}
				<TarifField
					bind:form={formHandler.form}
					errors={formHandler.errors}
					seance
					indemnite={formHandler.form.lieu_id === 3}
					consultatif={[0, 1, 4, 5].includes(formHandler.form.groupe_id)}
					seconde_seance={[1, 4, 6].includes(formHandler.form.groupe_id)}
					rapport={[1, 4, 5].includes(formHandler.form.groupe_id)}
					intake={formHandler.form.groupe_id === 0}
					{tarifs} />
			{:else}
				<p class="col-span-full mt-2 text-sm text-red-600">
					Veuillez remplir les champs de la nomenclature pour pouvoir définir les tarifs
				</p>
			{/if}
		{/if}
		<!--* Qu'il soit conventionne ou non l'utilisateur peut compter des suppléments -->
		<SupplementField
			bind:value={formHandler.form.supplements}
			errors={formHandler.errors}
			{supplements} />
	</FormSection>
	<SubmitButton id="sp-submit" className="col-span-full" disabled={!formHandler.isDirty} />
</Form>
