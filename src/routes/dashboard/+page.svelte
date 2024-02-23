<script>
	import { PatientForm, user, AnnexeA, supabase } from '../../lib/index';
	import { patients } from '../../lib/stores/PatientStore';
	import { FactureMutuelle } from '../../lib/pdfs/factureMutuelle';
	import SituationPathologiqueSelector from '../../lib/forms/documents/SituationPathologiqueSelector.svelte';
	import AnnexeAForm from '../../lib/forms/documents/AnnexeAForm.svelte';
	import AnnexeBForm from '../../lib/forms/documents/AnnexeBForm.svelte';

	console.log($patients);
	let pdfGenerator = new AnnexeA('generated.pdf', {
		situation_pathologique: 18,
		patient: $patients[0],
		premiereSeance: new Date()
	});
	function doPDF() {
		let facture = new FactureMutuelle({
			patient: $patients[0],
			tableRows: [
				{
					Nom: `${$patients[0].nom}\n${$patients[0].prenom}`,
					NISS: $patients[0].niss,
					Codes: 'Blablbal\nblabla',
					'Nbr. de codes utilisés': '10',
					total: '1800'
				}
			]
		});
		facture.save();
	}

	function doFacturePatient() {
		let att = {
			attestation: {
				date: '20/12/2023',
				porte_prescr: false,
				seances: [
					{ code_reference: '561013', date: '29/11/23' },
					{ code_reference: '639170', date: '29/11/23' },
					{ code_reference: '561013', date: '01/12/23' },
					{ code_reference: '639170', date: '01/12/23' },
					{ code_reference: '561013', date: '04/12/23' },
					{ code_reference: '639170', date: '04/12/23' },
					{ code_reference: '561013', date: '06/12/23' },
					{ code_reference: '639170', date: '06/12/23' },
					{ code_reference: '561013', date: '08/12/23' },
					{ code_reference: '639170', date: '08/12/23' },
					{ code_reference: '561013', date: '11/12/23' },
					{ code_reference: '639170', date: '11/12/23' },
					{ code_reference: '561013', date: '13/12/23' },
					{ code_reference: '639170', date: '13/12/23' },
					{ code_reference: '561013', date: '15/12/23' },
					{ code_reference: '639170', date: '15/12/23' },
					{ code_reference: '561013', date: '18/12/23' },
					{ code_reference: '639170', date: '18/12/23' },
					{ code_reference: '561013', date: '20/12/23' },
					{ code_reference: '639170', date: '20/12/23' }
				],
				total_recu: '305'
			},
			is_nine_pin: true,
			kine: {
				adresse: 'rue Joseph Wauters, 40',
				cp: '6250',
				inami: '5/44037/36/527',
				localite: 'Roselies',
				nom: 'Vullo',
				numero_bce: '0641787533',
				prenom: 'Gianni'
			},
			patient: {
				adresse: 'Rue du Sart Allet 145',
				cp: '6200',
				localite: 'Chatelineau',
				mutualite: '509',
				niss: '55052241221',
				nom: 'Janson',
				prenom: 'Anne-Marie'
			},
			prescription: {
				date: '25 10 2021',
				jointe_a: '2021-12-24',
				prescripteur: {
					inami: '18339433-770',
					nom: 'Francart',
					prenom: 'Joseph'
				}
			},
			situation_pathologique: {
				numero_etablissment: '',
				service: ''
			}
		};

	}
	function doPDF2() {
		pdfGenerator.save();
	}
</script>

<button on:click={doPDF}>Facture mutuelle</button>
<button on:click={doPDF2}>Annexe A</button>
<button on:click={() => {
	supabase.storage.from('static').list('codes').then((res) => {
		console.log(res);
	});
}}>Test</button>

<AnnexeBForm patient={$patients[0]} sp={$patients[0].situations_pathologiques[0]} />
<!--? features :
 => vote de la communauté
 => actions rapides
 => webSite related features
 => today's appointments
 => other ? -->

<!-- pdfTest -->
<!-- <button class="variant-ringed-tertiary btn" on:click={() => pdfGenerator.save()}>Generate PDF</button> -->
