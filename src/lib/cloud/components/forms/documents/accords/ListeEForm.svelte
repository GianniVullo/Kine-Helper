<script>
	import { Form, FormSection, SubmitButton, Field } from '../../../../../components/forms/blocks';
	import { Formulaire } from '../../../../libraries/formHandler.svelte';
	import {
		bilanFonctionnel,
		bilanPrecedent,
		descriptionFields,
		first_time_field,
		limitationActivite,
		ListeESchema,
		validateurs
	} from './ListeESchema.svelte';
	import { ListeEPDF } from './ListeEPDF.svelte';
	import { BaseDirectory, writeFile } from '@tauri-apps/plugin-fs';
	import RichTextEditor from '../../../../libraries/rich-text-editor/RichTextEditor.svelte';

	let formHandler = new Formulaire({
		initialValues: {
			id: 'liste_e',
			date: '2024-01-01',
			form_data: {
				first_time: true,
				p2a: 2,
				p2b: `Læe patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et toutLe patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et toutLe patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et tout !
                    - Moins de soins sur les foisonnements
                    - plus de traces sur le nutella`,
				p2e: '24 ans',
				p2d: 3,
				p2c: `Le patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et toutLe patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et toutLe patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et tout !
                    - Moins de soins sur les foisonnements
                    - plus de traces sur le nutella`,
				p2f: `- Moins de soins sur les foisonnements
                    - plus de traces sur le nutella`,
				p2g: `- Moins de soins sur les foisonnements
                    - plus de traces sur le nutella`,
				p2h: `- Moins de soins sur les foisonnements
                    - plus de traces sur le nutella`,
				p3a: 4,
				p3b: 'Le patient a besoin de faire des chose par lui même et même',
				p3c: 'Le patient a besoin de faire des chose par lui même et même',
				p3d: 1,
				p3e: `Le patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et toutLe patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et toutLe patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et tout !`,
				p3f: `Le patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et toutLe patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et toutLe patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et tout !`,
				p3g: `Le patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et toutLe patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et toutLe patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et tout !`,
				p3h: 4,
				p3i: `Le patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et toutLe patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et toutLe patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et tout !`,
				p4a: `Ceci est un texte de remplissage très sérieux, mais en réalité, il parle de licornes qui dansent la salsa sur des toits de Paris pendant que des baguettes chantent l’hymne national en fa dièse mineur.`,
				p4b: `Ceci est un texte de remplissage très sérieux, mais en réalité, il parle de licornes qui dansent la salsa sur des toits de Paris pendant que des baguettes chantent l’hymne national en fa dièse mineur.`,
				p4c: '49 ans ',
				p4d: 12987,
				p4e: 14,
				p4f: "J'en ai pas fuck you",
				p5a: `Ceci est un texte que je n'ai pas fait rédigé par chatgpt parce qu'il n'est pas très marrant...`
			}
		},
		schema: ListeESchema,
		validateurs,
		onValid: async (form) => {
			console.log('Form is valid:', form);
			let liste_e = new ListeEPDF({
				document: form,
				patient: {
					id: '123456789',
					nom: 'Jean',
					prenom: 'Dupont',
					mutuelle: 319
				}
			});
			await liste_e.buildPdf();
			const pdfBytes = await liste_e.doc.save();
			await writeFile('liste_e.pdf', pdfBytes, { baseDir: BaseDirectory.AppLocalData });
			console.log('PDF created successfully!');
		}
	});
</script>

<RichTextEditor />

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
