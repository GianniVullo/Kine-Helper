<script>
	import { PatientForm } from '$lib/index';
	import { t } from '../../../../lib/i18n';
</script>

<div class="flex flex-col items-start justify-start">
	<h1 class="text-xl text-surface-500 dark:text-success-400">
		{$t('patient.create', 'title')}
	</h1>
	<a href="/dashboard/patients" class="text-sm text-surface-400 dark:text-surface-600">{$t('patient.create', 'back')}</a>
	<PatientForm />
</div>
