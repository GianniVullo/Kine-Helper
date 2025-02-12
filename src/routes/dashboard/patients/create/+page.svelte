<script>
	import PatientForm from '../../../../lib/cloud/components/forms/patient/PatientForm.svelte';
	import { t } from '../../../../lib/i18n';
	import { appState } from '../../../../lib/managers/AppState.svelte';

	console.log('THE SATA FROM APPSTATE', appState.user_data);
</script>

<div class="flex flex-col items-start justify-start">
	<a href="/dashboard/patients" class="text-sm text-surface-400 dark:text-surface-600"
		>{$t('patient.create', 'back')}</a>
	<PatientForm />
</div>
