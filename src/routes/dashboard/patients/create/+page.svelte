<script>
	import { PatientForm } from '$lib/index';
	import PageTitle from '$lib/ui/PageTitle.svelte'
</script>

<div class="flex flex-col justify-start items-start">
	<PageTitle titre="Formulaire Patient" />
	<a href="/dashboard/patients" class="text-sm text-surface-400 dark:text-surface-600">retour</a>
	<PatientForm />
</div>
