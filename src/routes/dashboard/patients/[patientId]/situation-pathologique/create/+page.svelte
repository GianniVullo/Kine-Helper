<script>
	import SPForm from '$lib/components/forms/SPForm.svelte';

	let { data } = $props();
	const { patient, tarifs, supplements } = data;
</script>

<SPForm {patient} {tarifs} {supplements} />
