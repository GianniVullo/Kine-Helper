<script>
	import { PatientForm, user, AnnexeA, supabase } from '../../lib/index';
	import { patients } from '../../lib/stores/PatientStore';
	import { FactureMutuelle } from '../../lib/pdfs/factureMutuelle';
	import SituationPathologiqueSelector from '../../lib/forms/documents/SituationPathologiqueSelector.svelte';
	import AnnexeAForm from '../../lib/forms/documents/AnnexeAForm.svelte';
	import AnnexeBForm from '../../lib/forms/documents/AnnexeBForm.svelte';

	console.log($patients);
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
</script>

<!--? features :
 => vote de la communauté
 => actions rapides
 => webSite related features
 => today's appointments
 => other ? -->

<!-- pdfTest -->
<!-- <button class="variant-ringed-tertiary btn" on:click={() => pdfGenerator.save()}>Generate PDF</button> -->
