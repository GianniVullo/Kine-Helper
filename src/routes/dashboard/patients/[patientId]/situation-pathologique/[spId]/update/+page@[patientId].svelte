<script>
	import SpForm from '$lib/components/forms/SPForm.svelte';

	let { data } = $props();
	const { patient, sp, tarifs, supplements } = data;
</script>

<SpForm {patient} {tarifs} {supplements} {sp} mode="update" />
