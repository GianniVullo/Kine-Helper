<script>
	import SPForm from '../../../../../../lib/cloud/components/forms/situation-pathologique/SPForm.svelte';
	import { t } from '../../../../../../lib/i18n';

	let { data } = $props();
	const patient = data.patient;
</script>

<div class="flex flex-col">
	<h3 class="text-xl font-medium text-surface-300 dark:text-surface-500">
		{$t('sp.create', 'title')}
	</h3>
	<SPForm {patient} />
	<!-- <SituationPathologiqueForm patient={getContext('patient')} /> -->
</div>
