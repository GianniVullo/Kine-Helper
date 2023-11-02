<script>
	import { PatientForm } from '$lib/index';
	import PageTitle from '$lib/ui/PageTitle.svelte'
</script>

<PageTitle titre="Formulaire Patient" />
<a href="/dashboard/patients" class="text-sm text-surface-400 dark:text-surface-600">retour</a>
<PatientForm />
