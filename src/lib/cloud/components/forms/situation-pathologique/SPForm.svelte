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
	import { getTarificationInitialValues } from '../tarification-fields/tarifHelpers';

	let { patient, sp, mode = 'create', tarifs, supplements } = $props();
	console.log(
		'sp',
		sp?.seances.some((s) => s.has_been_attested)
	);

	let formHandler = new Formulaire({
		validateurs,
		schema: SPSchema,
		submiter: '#sp-submit',
		initialValues: {
			user_id: sp?.user_id ?? appState.user.id,
			patient_id: sp?.patient_id ?? patient.patient_id,
			sp_id: sp?.sp_id ?? crypto.randomUUID(),
			motif: sp?.motif,
			plan_du_ttt: sp?.plan_du_ttt,
			created_at: sp?.created_at ?? dayjs().format('YYYY-MM-DD'),
			volet_j: sp?.metadata?.volet_j ?? false,
			duree_ss_fa: sp?.metadata?.duree_ss_fa ?? -1,
			amb_hos: sp?.amb_hos,
			gmfcs: sp?.gmfcs,
			groupe_id: sp?.groupe_id,
			lieu_id: sp?.lieu_id,
			duree: sp?.duree,
			patho_lourde_type: sp?.patho_lourde_type,
			...getTarificationInitialValues(sp, tarifs),
			supplements: sp?.metadata?.ss ?? []
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

	const groupeOptions = groupes()
		.map((val, index) => ({
			label: val,
			value: index,
			id: `groupe${index}`
		}))
		.filter((_, index) => (sp?.groupe_id ? sp.groupe_id === index : true));

	onMount(() => {
		formHandler.setup();
	});

	let lieuOptions = $state([]);

	$effect(() => {
		const lpG = lieuxParGroupe[formHandler.form.groupe_id];
		console.log('lpG', lpG);
		if (typeof formHandler.form.groupe_id === 'number' && mode === 'create') {
			untrack(() => {
				formHandler.form.lieu_id = undefined;

				lieuOptions = lieux()
					.map((val, index) => ({
						label: val,
						value: index,
						id: `lieu${index}`
					}))
					.filter((_, index) => lpG?.[0] === '*' || lpG?.includes(index));
				formHandler.form.duree = undefined;
				formHandler.form.patho_lourde_type = undefined;
				formHandler.form.amb_hos = undefined;
				formHandler.form.has_seconde_seance = undefined;
				formHandler.form.gmfcs = undefined;
			});
		} else {
			untrack(() => {
				lieuOptions = lieux()
					.map((val, index) => ({
						label: val,
						value: index,
						id: `lieu${index}`
					}))
					.filter((_, index) => lpG?.[0] === '*' || lpG?.includes(index));
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
		{#if sp?.seances.some((s) => s.has_been_attested)}
			<p class="col-span-full mt-2 text-sm text-black">
				Vous ne pouvez pas modifier les informations de nomenclature d'une sp contenant des séances
				déjà attestées
			</p>
		{:else}
			<NomenclatureDefinerFields
				{lieuOptions}
				{groupeOptions}
				bind:form={formHandler.form}
				errors={formHandler.errors} />
		{/if}
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
			errors={formHandler.errors['supplements']}
			{supplements} />
	</FormSection>
	<SubmitButton id="sp-submit" className="col-span-full" />
	<!-- <div class="col-span-full"><p class="w-60">{JSON.stringify(formHandler.form)}</p></div> -->
</Form>
