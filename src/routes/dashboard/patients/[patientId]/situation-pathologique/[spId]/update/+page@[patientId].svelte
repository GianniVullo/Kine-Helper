<script>
	import SpForm from '../../../../../../../lib/cloud/components/forms/situation-pathologique/SPForm.svelte';

	let { data } = $props();
	const { patient, sp, tarifs, supplements } = data;
</script>

<SpForm {patient} {tarifs} {supplements} {sp} mode="update" />
