<script>
	import { nullish, object, pipe, string, transform, uuid } from 'valibot';
	import { Formulaire } from '../../../../lib/cloud/libraries/formHandler.svelte';
	import { Form, FormSection, SubmitButton } from '../../../../lib/components/forms/blocks';
	import { terminal } from 'virtual:terminal';
	import SimpleSelect from '../../../../lib/components/forms/fields/SimpleSelect.svelte';

	const myOrganisations = [
		{ id: 'org1', name: 'Mon cabinet', logo_path: null },
		{ id: 'org2', name: 'Cabinet de kiné', logo_path: null },
		{ id: 'org3', name: 'Cabinet de rééducation', logo_path: null },
		{ id: 'org4', name: 'Centre de santé', logo_path: null }
	];

	const organisationSchema = {
		id: pipe(string(), uuid()),
		name: string(),
		logo_path: nullish(string())
	};
	let organisationForm = new Formulaire({
		validateurs: organisationSchema,
		schema: pipe(
			object(organisationSchema),
			transform((value) => {
				return {
					nom: value.nom
				};
			})
		),
		initialValues: {
			id: 'org1',
			name: 'Mon cabinet',
			logo_path: null
		},
		async onValid(data) {
			terminal.log('Organisation updated:', data.name);
			// Here you would typically send the data to your backend
		},
		formElement: '#organisation-form',
		submiter: '#organisation-btn'
	});

	const fieldSchema = [
		{
			id: 'org_name',
			name: 'name',
			inputType: 'text',
			titre: "Nom de l'organisation",
			placeholder: "Nom de l'organisation",
			outerCSS: 'col-span-4'
		},
		{
			id: 'org_logo',
			name: 'logo_path',
			inputType: 'file',
			titre: 'Logo de l’organisation',
			placeholder: 'Télécharger un logo',
			outerCSS: 'col-span-4',
			help: 'Formats acceptés : PNG, JPG, AVIF. Taille maximale : 2 Mo.'
		}
	];
</script>

<!--* Sélectionner une organisation -->
<div class="-mt-10 -mb-4">
	<SimpleSelect
		onchange={(e) => {
			const selectedOrganisation = myOrganisations.find((org) => org.id === e.target.value);
			organisationForm.form.id = selectedOrganisation.id;
			organisationForm.form.name = selectedOrganisation.name;
			organisationForm.form.logo_path = selectedOrganisation.logo_path;
			terminal.log('Selected organisation:', selectedOrganisation);
		}}
		options={myOrganisations.map((org) => ({ value: org.id, label: org.name }))} />
</div>

<Form id="organisation-form" message={organisationForm.message}>
	<FormSection
		titre={'Données de ' + organisationForm.form?.name}
		fields={fieldSchema}
		errors={organisationForm.errors}
		bind:form={organisationForm.form} />
	{#if organisationForm.form.logo_path}
		<div class="">
			<img src={organisationForm.form.logo_path} alt="Logo de l'organisation" />
		</div>
	{/if}
	<SubmitButton id="organisation-btn" />
</Form>
