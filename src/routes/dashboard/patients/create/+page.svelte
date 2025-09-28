<script>
	import PatientForm from '$lib/components/forms/PatientForm.svelte';
	import { t } from '../../../../lib/i18n';
</script>

<div class="flex flex-col items-start justify-start">
	<a href="/dashboard/patients" class="text-surface-400 dark:text-surface-600 text-sm"
		>{$t('patient.create', 'back')}</a>
	<PatientForm />
</div>
