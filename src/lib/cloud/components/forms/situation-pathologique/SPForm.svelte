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
	import { lieux, lieuxParGroupe } from '../../../../stores/codeDetails';

	let { patient, sp, mode = 'create', tarifs, supplements } = $props();

	function isItTheOne(value, id) {
		const parsedMetadata = JSON.parse(value.metadata);
		if (parsedMetadata) {
			return parsedMetadata[id];
		}
	}

	let formHandler = new Formulaire({
		validateurs,
		schema: SPSchema,
		submiter: '#sp-submit',
		initialValues: sp ?? {
			user_id: appState.user.id,
			patient_id: patient.patient_id,
			sp_id: crypto.randomUUID(),
			created_at: dayjs().format('YYYY-MM-DD'),
			tarif_seance: tarifs.find((t) => isItTheOne(t, 'seance'))?.id,
			tarif_indemnite: tarifs.find((t) => isItTheOne(t, 'indemnite'))?.id,
			tarif_rapport_ecrit: tarifs.find((t) => isItTheOne(t, 'rapport_ecrit'))?.id,
			tarif_consultatif: tarifs.find((t) => isItTheOne(t, 'consultatif'))?.id,
			tarif_seconde_seance: tarifs.find((t) => isItTheOne(t, 'seconde_seance'))?.id,
			tarif_intake: tarifs.find((t) => isItTheOne(t, 'intake'))?.id,
			tarif_seance_custom: tarifs.find((t) => isItTheOne(t, 'seance'))?.valeur,
			tarif_indemnite_custom: tarifs.find((t) => isItTheOne(t, 'indemnite'))?.valeur,
			tarif_rapport_ecrit_custom: tarifs.find((t) => isItTheOne(t, 'rapport_ecrit'))?.valeur,
			tarif_consultatif_custom: tarifs.find((t) => isItTheOne(t, 'consultatif'))?.valeur,
			tarif_seconde_seance_custom: tarifs.find((t) => isItTheOne(t, 'seconde_seance'))?.valeur,
			tarif_intake_custom: tarifs.find((t) => isItTheOne(t, 'intake'))?.valeur
		},
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

	let lieuOptions = $state([]);

	$effect(() => {
		formHandler.form.groupe_id;
		if (typeof formHandler.form.groupe_id === 'number') {
			const lpG = lieuxParGroupe[formHandler.form.groupe_id];

			untrack(() => {
				formHandler.form.lieu_id = undefined;

				lieuOptions = lieux()
					.map((val, index) => ({
						label: val,
						value: index,
						id: `lieu${index}`
					}))
					.filter((_, index) => lpG[0] === '*' || lpG.includes(index));
				formHandler.form.duree = undefined;
				formHandler.form.patho_lourde_type = undefined;
				formHandler.form.amb_hos = undefined;
				formHandler.form.has_seconde_seance = undefined;
				formHandler.form.gmfcs = undefined;
			});
		}
	});
</script>

<Form title={$t('sp.create', 'title')} message={formHandler.message}>
	<FormSection
		titre="Informations générales"
		fields={fieldSchema}
		bind:form={formHandler.form}
		errors={formHandler.errors} />
	<FormSection
		titre="Informations relative à la nomenclature"
		description="Ces champs permettent à Kiné Helper d'assigner les bons codes de nomenclatures à vos séances.">
		<NomenclatureDefinerFields
			{lieuOptions}
			bind:form={formHandler.form}
			errors={formHandler.errors} />
	</FormSection>
	<FormSection
		titre="Informations relative à la tarification"
		description="Ces champs ne sont pas obligatoires. Veuillez remplir ce qui est digne d'intérêt.">
		<!--* Si l'utilisateur n'est pas conventionné il peut utiliser les tarifs qu'il veut -->
		{#if !appState.user.conventionne}
			<!-- TODO: Ici Il faut mettre un "en attente de définition de la nomenclature" pour connaitre les champs nécessaires -->
			{#if displayTarifs}
				<TarifField bind:form={formHandler.form} errors={formHandler.errors} all {tarifs} />
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
	<SubmitButton id="sp-submit" className="col-span-full" />
	<div class="col-span-full"><p class="w-60">{JSON.stringify(formHandler.form)}</p></div>
</Form>
