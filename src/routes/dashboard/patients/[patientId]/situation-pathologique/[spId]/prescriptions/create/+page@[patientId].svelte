<script>
	import PrescriptionForm from '../../../../../../../../lib/cloud/components/forms/prescription/PrescriptionForm.svelte';
	import { t } from '../../../../../../../../lib/i18n';

	let { data } = $props();
	let { patient, sp } = data;
</script>

<PrescriptionForm {patient} {sp} />
