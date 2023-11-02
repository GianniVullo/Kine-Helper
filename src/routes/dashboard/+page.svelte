<script>
	import { PatientForm, user } from '$lib/index';
	import PostSignupForm from '../../lib/forms/authentication/PostSignupForm.svelte';
	import SituationPathologiqueForm from '../../lib/forms/situation-pathologique/SituationPathologiqueForm.svelte';
	console.log($user);
</script>

<!--? features :
 => vote de la communauté
 => actions rapides
 => webSite related features
 => today's appointments
 => other ? -->
<SituationPathologiqueForm />
