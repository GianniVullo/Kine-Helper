<script>
	import { BaseDirectory, writeFile } from '@tauri-apps/plugin-fs';
	import SubmitButton from '../../../../../forms/ui/SubmitButton.svelte';
	import { Formulaire } from '../../../../libraries/formHandler.svelte';
	import Field from '../../abstract-components/Field.svelte';
	import Form from '../../abstract-components/Form.svelte';
	import FormSection from '../../abstract-components/FormSection.svelte';
	import { TinettiPDF } from './TinettiPDF.svelte';
	import { fields, TinettiSchema, validateurs } from './TinettiSchema.svelte';

	let formHandler = new Formulaire({
		schema: TinettiSchema,
		initialValues: {
			1: 0,
			2: 0,
			3: 0,
			4: 0,
			5: 0
		},
		validateurs,
		onValid: async (form) => {
			console.log('Form is valid:', form);
			let pdfDoc = new TinettiPDF({
				document: {
					id: 'tinetti',
					date: '01/01/2024',
					form_data: form
				},
				patient: {
					id: '123456789',
					nom: 'Jean',
					prenom: 'Dupont'
				}
			});
			console.log(pdfDoc);
			await pdfDoc.buildPdf();
			const pdfBytes = await pdfDoc.doc.save();

			await writeFile('test.pdf', pdfBytes, { baseDir: BaseDirectory.AppLocalData });
			console.log('PDF created successfully!');
		}
	});
</script>

<Form title="Test de Tinetti" message={formHandler.message}>
	<FormSection titre="Équilibre">
		{#each fields.balance.map((f) => {
			f.inputType = 'radioWithPanel';
			f.outerCSS = 'col-span-full';
			f.options = f.options.map((o) => {
				o.description = `score : ${o.value}`;
				return o;
			});
			return f;
		}) as field}
			{console.log('Balance fields:', formHandler.form[field.id])}
			<Field {field} bind:value={formHandler.form[field.id]} error={formHandler.errors[field.id]} />
		{/each}
	</FormSection>
	<FormSection titre="Marche">
		{#each fields.gait.map((f) => {
			f.inputType = 'radioWithPanel';
			f.outerCSS = 'col-span-full';
			return f;
		}) as field}
			<Field {field} bind:value={formHandler.form[field.id]} error={formHandler.errors[field.id]} />
		{/each}
	</FormSection>
	<SubmitButton />
</Form>
