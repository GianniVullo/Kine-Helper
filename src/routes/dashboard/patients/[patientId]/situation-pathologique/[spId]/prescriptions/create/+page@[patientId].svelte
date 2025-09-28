<script>
	import PrescriptionForm from '$lib/components/forms/PrescriptionForm.svelte';
	// import { t } from '$lib/i18n';

	let { data } = $props();
	let { patient, sp } = data;
</script>

<PrescriptionForm {patient} {sp} />
