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

	let { patient, sp, mode = 'create' } = $props();

	let formHandler = new Formulaire({
		validateurs,
		schema: SPSchema,
		submiter: '#sp-submit',
		initialValues: sp ?? {
			user_id: appState.user.id,
			patient_id: patient.patient_id,
			sp_id: crypto.randomUUID(),
			created_at: dayjs().format('YYYY-MM-DD')
		},
		onValid,
		mode
	});
console.log(appState.user);

	onMount(() => {
		formHandler.setup();
	});

	let lieuOptions = $state([]);

	$effect(() => {
		console.log('RUNNING WITH ', formHandler.form.groupe_id);
		formHandler.form.groupe_id;
		if (typeof formHandler.form.groupe_id === 'number') {
			const lpG = lieuxParGroupe[formHandler.form.groupe_id];
			console.log(lpG);

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
		description="Ces champs ne sont pas obligatoires mais vont vous faire gagner du temps par la suite">
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
		HEU
			<TarifField bind:form={formHandler.form} errors={formHandler.errors} />
		{/if}
		<!--* Qu'il soit conventionne ou non l'utilisateur peut compter des suppléments -->
		<SupplementField bind:value={formHandler.form.supplements} errors={formHandler.errors} />
	</FormSection>
	<SubmitButton id="sp-submit" className="col-span-full" />
	<div class="col-span-full"><p class="w-60">{JSON.stringify(formHandler.form)}</p></div>
</Form>
