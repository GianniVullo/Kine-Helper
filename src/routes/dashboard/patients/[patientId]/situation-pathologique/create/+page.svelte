<script>
	import SPForm from '../../../../../../lib/cloud/components/forms/situation-pathologique/SPForm.svelte';

	let { data } = $props();
	const { patient, tarifs, supplements } = data;
</script>

<SPForm {patient} {tarifs} {supplements} />
