<script>
	import SPForm from '../../../../../../lib/cloud/components/forms/situation-pathologique/SPForm.svelte';

	import { t } from '../../../../../../lib/i18n';

	let { data } = $props();
	const patient = data.patient;
</script>

<SPForm {patient} />
