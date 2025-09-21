<script>
	import {  nullish, object, pipe, string, uuid } from 'valibot';
	import { Formulaire } from '../../../../lib/cloud/libraries/formHandler.svelte';
	import { Form, FormSection, SubmitButton } from '../../../../lib/components/forms/blocks';
	import { appState } from '../../../../lib/managers/AppState.svelte.js';
	import { isEmpty } from 'lodash';
	import SimpleSelect from '../../../../lib/components/forms/fields/SimpleSelect.svelte';
	import { supabase } from '../../../../lib/stores/supabaseClient';
	import { info } from '../../../../lib/cloud/libraries/logging';

	const organisationSchema = {
		id: pipe(string(), uuid()),
		name: string(),
		logo_path: nullish(string())
		// logo: nullish(
		// 	array(
		// 		pipe(
		// 			file('Please select an image file.'),
		// 			mimeType(['image/jpeg', 'image/png'], 'Please select a JPEG or PNG file.'),
		// 			maxSize(1024 * 1024 * 2, 'Please select a file smaller than 10 MB.')
		// 		)
		// 	)
		// )
	};
	let organisationForm = new Formulaire({
		validateurs: organisationSchema,
		schema: object(organisationSchema),
		initialValues: appState.selectedOrg,
		async onValid(data) {
			console.log('DATA:', data);
			info('Organisation updated:', data);
			// Check if there is a new image
			// let img = data.logo[0];
			// if (img) {
			// 	info('img ', img);
			// 	// First create a local stored copy so that the API works the way it should. (definately not a best practice but it does work and isn't introducing anything critically slow so...)
			// 	let status = await save_local_file('', img.name, img);
			// 	info(status);

			// 	const from = `${await completePath()}${platform() === 'windows' ? '\\' : '/'}${img.name}`;
			// 	info(from);
			// 	// Then Compress the shit out of it
			// 	let bytes = await invoke('compress_img_at_path', {
			// 		from
			// 	});
			// 	let avifName = `${data.id}.avif`;

			// 	const byteArray = new Uint8Array(bytes);
			// 	const file = new File([byteArray], avifName, {
			// 		type: 'image/avif'
			// 	});
			// 	// Send it to the logo bucket
			// 	let { data, error } = await supabase.storage
			// 		.from('Team-logo')
			// 		.upload(avifName, file, { upsert: true });

			// 	console.log(data, error);
			// 	// delete the local stored copy
			// 	let resp = await remove(avifName, { baseDir: baseDir() });
			// }
			// Filter updated fields
			const updatedFields = this.filtrerLesChampsAUpdater();
			// If needed, update Remote data
			if (!isEmpty(updatedFields)) {
				let { data: supaRes, error } = await supabase
					.from('organizations')
					.update(updatedFields)
					.eq('id', data.id);
				if (error) {
					info(error);
					this.onError(error);
				}
				console.log(supaRes, error);
				// update cache state
				appState.organizations = appState.organizations.map((o) => {
					if (o.id === data.id) {
						o.name = data.name;
					}
					return o;
				});
			}
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
		// {
		// 	id: 'org_logo',
		// 	name: 'logo',
		// 	inputType: 'file',
		// 	titre: 'Changer le logo de l’organisation',
		// 	outerCSS: 'col-span-4',
		// 	help: 'Formats acceptés : PNG, JPG, AVIF. Taille maximale : 2 Mo.'
		// },
		{
			id: 'logo_path',
			name: 'logo_path',
			inputType: 'hidden'
		}
	];
</script>

<!--* Sélectionner une organisation -->
<div class="-mt-10 -mb-4">
	<SimpleSelect
		onchange={(e) => {
			appState.set_selected_organization(e.target.value);
			organisationForm.form.id = selectedOrganisation.id;
			organisationForm.form.name = selectedOrganisation.name;
			organisationForm.form.logo_path = selectedOrganisation.logo_path;
		}}
		options={appState.organizations.map((org) => ({ value: org.id, label: org.name }))} />
</div>

<Form id="organisation-form" message={organisationForm.message}>
	<FormSection
		titre={'Données de ' + organisationForm.form?.name}
		fields={fieldSchema}
		errors={organisationForm.errors}
		bind:form={organisationForm.form} />
	<SubmitButton id="organisation-btn" />
</Form>
