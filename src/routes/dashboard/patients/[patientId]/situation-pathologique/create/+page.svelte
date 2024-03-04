<script>
	import { user } from '../../../../../../lib';
	import SPForm from '../../../../../../lib/forms/situation-pathologique/SPForm.svelte';
	import { patients } from '../../../../../../lib/stores/PatientStore';
	import { page } from '$app/stores';
	import { t } from '../../../../../../lib/i18n';
	const patient = $patients.find((p) => p.patient_id === $page.params.patientId);
</script>

<div class="flex flex-col">
	<h3 class="text-xl font-medium text-surface-300 dark:text-surface-500">
		{$t('sp.create', 'title')}
	</h3>
	<SPForm {patient} />
	<!-- <SituationPathologiqueForm patient={getContext('patient')} /> -->
</div>
