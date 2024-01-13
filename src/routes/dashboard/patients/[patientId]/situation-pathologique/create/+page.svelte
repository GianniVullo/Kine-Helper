<script>
	import { user } from "../../../../../../lib";
	import SituationPathologiqueForm from "../../../../../../lib/forms/situation-pathologique/SituationPathologiqueForm.svelte";
	import { getContext } from "svelte";
	console.log('in page sp create',getContext('patient'));
	console.log($user)
</script>

<div class="flex flex-col">
	<h3 class="text-xl font-medium text-surface-300 dark:text-surface-500">Création d'une nouvelle situation pathologique</h3>
	<SituationPathologiqueForm patient={getContext('patient')} />
</div>