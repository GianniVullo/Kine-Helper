<script>
	import { BaseDirectory, create, readFile, writeFile } from '@tauri-apps/plugin-fs';
	import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
	import TinettiForm from '../../../lib/cloud/components/forms/documents/testings/TinettiForm.svelte';
	import { ListeEPDF } from '../../../lib/cloud/components/forms/documents/accords/ListeEPDF.svelte';
	import ListeEForm from '../../../lib/cloud/components/forms/documents/accords/ListeEForm.svelte';
	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	async function createPDF() {
		let liste_e = new ListeEPDF({
			document: {
				id: 'liste_e',
				date: '01/01/2024',
				form_data: {
					first_time: true,
					p2a: 2,
					p2b: `Læe patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et toutLe patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et toutLe patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et tout !
                    - Moins de soins sur les foisonnements
                    - plus de traces sur le nutella`,
					p2c: 3,
					p2d: '24 ans, 18 mois, 3 jours et 27 heures',
					p2e: `Le patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et toutLe patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et toutLe patient a besoin de faire des chose par lui même et même, je dirais, de dire des choses chouettes et tout !
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
					p4c: '49 ans et 3 mois. Et 16 heures.',
					p4d: 12987.3,
					p4e: 14,
					p4f: "J'en ai pas fuck you",
					p5a: `Ceci est un texte que je n'ai pas fait rédigé par chatgpt parce qu'il n'est pas très marrant...`
				}
			},
			patient: {
				id: '123456789',
				nom: 'Jean',
				prenom: 'Dupont',
				niss: '1234567890123',
				date_naissance: '01/01/1990',
				sexe: 'M',
				adresse: '123 Rue de la Santé',
				cp: '75001',
				localite: 'Paris',
				telephone: '0123456789',
				email: 'test1234@gmail.com',
				mutuelle: 319
			},
			sp: {}
		});
		await liste_e.buildPdf();

		const pdfBytes = await liste_e.doc.save();
		await writeFile('test.pdf', pdfBytes, { baseDir: BaseDirectory.AppLocalData });
		console.log('PDF created successfully!');
	}
	// createPDF();
</script>

<!-- Test pour les pdfs -->

<button class="rounded bg-blue-500 px-4 py-2 text-white" onclick={createPDF}> Créer un PDF </button>

<!-- <TinettiForm /> -->
<div class="px-4 py-12">
	<ListeEForm />
</div>
