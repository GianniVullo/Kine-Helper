<script>
	import { PatientForm, user, AnnexeA, patients } from '../../lib/index';
	import PostSignupForm from '../../lib/forms/authentication/PostSignupForm.svelte';
	import SituationPathologiqueForm from '../../lib/forms/situation-pathologique/SituationPathologiqueForm.svelte';
	console.log($user);
	let pdfGenerator = new AnnexeA('generated.pdf', {situation_pathologique: 18, patient: $patients[0], premiereSeance: new Date()})
</script>

<!--? features :
 => vote de la communauté
 => actions rapides
 => webSite related features
 => today's appointments
 => other ? -->

<!-- pdfTest -->
<button class="variant-ringed-tertiary btn" on:click={() => pdfGenerator.save()}>Generate PDF</button>
<SituationPathologiqueForm patient={$patients[0]} />
