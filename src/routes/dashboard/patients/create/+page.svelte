<script>
	import { PatientForm } from '$lib/index';
	import PageTitle from '$lib/ui/PageTitle.svelte';
</script>

<div class="flex flex-col items-start justify-start">
	<h1 class="text-xl text-surface-500 dark:text-success-400">Formulaire patient</h1>
	<a href="/dashboard/patients" class="text-sm text-surface-400 dark:text-surface-600">retour</a>
	<PatientForm />
</div>
