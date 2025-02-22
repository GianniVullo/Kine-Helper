<script>
	import { SPSchema, onValid, validateurs, fieldSchema } from './SPSchema';
	import { SubmitButton } from '../../../../forms/index';
	import { t } from '../../../../i18n';
	import Form from '../abstract-components/Form.svelte';
	import FormSection from '../abstract-components/FormSection.svelte';
	import dayjs from 'dayjs';
	import { Formulaire } from '../../../libraries/formHandler.svelte';
	import { appState } from '../../../../managers/AppState.svelte';
	import { onMount } from 'svelte';
	import NomenclatureDefinerFields from '../tarification-fields/NomenclatureDefinerFields.svelte';
	import SupplementField from '../tarification-fields/SupplementField.svelte';
	import TarifField from '../tarification-fields/TarifField.svelte';

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

	onMount(() => {
		formHandler.setup();
	});
</script>

<Form title={$t('sp.create', 'title')} message={formHandler.message}>
	<FormSection
		titre="Informations générales"
		fields={fieldSchema}
		bind:form={formHandler.form}
		errors={formHandler.errors} />
	{#if appState.user.conventionne}
		<FormSection
			titre="Informations relative à la tarification"
			description="Ces champs ne sont pas obligatoires. Veuillez remplir ce qui est digne d'intérêt.">
			<!--* Si l'utilisateur n'est pas conventionné il peut utiliser les tarifs qu'il veut -->
			{#if !appState.user.conventionne}
				<TarifField form={formHandler.form} errors={formHandler.errors} />
			{/if}
			<!--* Qu'il soit conventionne ou non l'utilisateur peut compter des suppléments -->
			<SupplementField form={formHandler.form} errors={formHandler.errors} />
		</FormSection>
	{/if}
	<FormSection
		titre="Informations relative à la nomenclature"
		description="Ces champs ne sont pas obligatoires mais vont vous faire gagner du temps par la suite">
		<NomenclatureDefinerFields bind:form={formHandler.form} errors={formHandler.errors} />
	</FormSection>
	<SubmitButton id="sp-submit" className="col-span-full" />
</Form>

{JSON.stringify(formHandler.form)}
<!-- {JSON.stringify(formHandler.form)} -->
