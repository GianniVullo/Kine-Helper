<script>
	import { Formulaire } from '../../cloud/libraries/formHandler.svelte.js';
	import { Field, Form, FormSection, SubmitButton } from './blocks';
	import {
		bilanFonctionnel,
		bilanPrecedent,
		descriptionFields,
		first_time_field,
		limitationActivite,
		ListeESchema,
		validateurs
	} from './schemas/ListeESchema.svelte';
	import { ListeEPDF } from '../../pdfs/ListeEPDF.svelte.js';
	import { appState } from '../../managers/AppState.svelte';

	let { doc, patient, sp } = $props();

	let formHandler = new Formulaire({
		initialValues: {
			id: doc?.id ?? crypto.randomUUID(),
			patient_id: doc?.patient?.patient_id ?? patient.patient_id,
			sp_id: doc?.sp?.sp_id ?? sp.sp_id,
			user_id: doc?.user_id ?? appState.user.id,
			date: doc?.data ?? new Date().toISOString().split('T')[0],
			metadata: {
				doc: 'E',
				first_time: doc?.metadata?.first_time ?? true,
				p2a: doc?.metadata?.p2a,
				p2b: doc?.metadata?.p2b,
				p2e: doc?.metadata?.p2e,
				p2d: doc?.metadata?.p2d,
				p2c: doc?.metadata?.p2c,
				p2f: doc?.metadata?.p2f,
				p2g: doc?.metadata?.p2g,
				p2h: doc?.metadata?.p2h,
				p3a: doc?.metadata?.p3a,
				p3b: doc?.metadata?.p3b,
				p3c: doc?.metadata?.p3c,
				p3d: doc?.metadata?.p3d,
				p3e: doc?.metadata?.p3e,
				p3f: doc?.metadata?.p3f,
				p3g: doc?.metadata?.p3g,
				p3h: doc?.metadata?.p3h,
				p3i: doc?.metadata?.p3i,
				p4a: doc?.metadata?.p4a,
				p4b: doc?.metadata?.p4b,
				p4c: doc?.metadata?.p4c,
				p4d: doc?.metadata?.p4d,
				p4e: doc?.metadata?.p4e,
				p4f: doc?.metadata?.p4f,
				p5a: doc?.metadata?.p5a
			},
			organization_id: appState.selectedOrg.id
		},
		schema: ListeESchema,
		validateurs,
		onValid: async (form) => {
			console.log('Form is valid:', form);
			let liste_e = new ListeEPDF({
				document: form,
				patient,
				sp
			});
			let { dirPath } = await liste_e.save();
			console.log('PDF created successfully!', dirPath);
		}
	});
</script>

<Form title="Création d'une demande pour Liste E (pathologie lourde)" message={formHandler.message}>
	<input type="hidden" name="id" bind:value={formHandler.form.id} />
	<Field field={first_time_field} bind:value={formHandler.form.form_data.first_time} />
	<Field
		field={{
			inputType: 'date',
			titre: 'Date de la demande',
			outerCSS: 'col-span-full sm:col-span-4'
		}}
		bind:value={formHandler.form.date}
		error={formHandler.errors.date} />
	<FormSection
		titre="DESCRIPTION"
		description="(À compléter par le médecin traitant avec la collaboration éventuelle du kinésithérapeute)">
		{#each descriptionFields as field}
			<Field
				{field}
				bind:value={formHandler.form.form_data[field.id]}
				error={formHandler.errors[field.id]} />
		{/each}
	</FormSection>
	<FormSection
		titre="A) Trouble(s) anatomique(s) et/ou fonctionnel(s)"
		description="(À compléter par le médecin traitant avec la collaboration éventuelle du kinésithérapeute)">
		{#each bilanFonctionnel as field}
			<Field
				{field}
				bind:value={formHandler.form.form_data[field.id]}
				error={formHandler.errors[field.id]} />
		{/each}
	</FormSection>
	<FormSection
		titre="B) Limitations d’activités & Restrictions de participation"
		description="L’activité désigne l’exécution d’une tâche ou d’une action par une personne. Les limitations d’activité désignent les difficultés que rencontre une personne dans l’exécution d’activités. La participation désigne l’implication d’une personne dans une situation de vie réelle. Les restrictions de participation désignent les problèmes qu’une personne peut rencontrer dans son implication dans une situation de vie réelle.">
		{#each limitationActivite as field}
			<Field
				{field}
				bind:value={formHandler.form.form_data[field.id]}
				error={formHandler.errors[field.id]} />
		{/each}
	</FormSection>
	<FormSection
		titre="C) Facteurs externes et personnels"
		description="Environnement physique et social pouvant agir comme facteur favorable ou aggravant. Facteurs personnels (tels que : âge, statut social, mode de vie, habitudes, formation, ….).">
		<Field
			field={{
				inputType: 'textarea',
				titre: 'Facteurs externes et personnels',
				outerCSS: 'col-span-full sm:col-span-5'
			}}
			bind:value={formHandler.form.form_data.p4a}
			error={formHandler.errors.p4a} />
	</FormSection>
	<FormSection titre="D) Résumé de la situation fonctionnelle">
		<Field
			field={{
				id: 'p4b',
				inputType: 'textarea',
				titre: 'Résumé de la situation fonctionnelle',
				outerCSS: 'col-span-full sm:col-span-5'
			}}
			bind:value={formHandler.form.form_data.p4b}
			error={formHandler.errors.p4b} />
	</FormSection>
	<FormSection
		titre="E) Résumé du bilan fonctionnel précédent"
		description="Concerne chaque demande de prolongation">
		{#each bilanPrecedent as field}
			<Field
				{field}
				bind:value={formHandler.form.form_data[field.id]}
				error={formHandler.errors[field.id]} />
		{/each}
	</FormSection>
	<FormSection
		titre="TECHNIQUES / TRAITEMENT"
		description="(À compléter par le médecin traitant avec la collaboration éventuelle d’un kinésithérapeute)">
		<Field
			field={{
				id: 'p5a',
				inputType: 'textarea',
				titre:
					'Traitement(s) kinésithérapeutique / physiothérapeutique en fonction du (des) but(s) du traitement',
				outerCSS: 'col-span-full sm:col-span-5'
			}}
			bind:value={formHandler.form.form_data.p5a} /></FormSection>
	<SubmitButton />
</Form>
